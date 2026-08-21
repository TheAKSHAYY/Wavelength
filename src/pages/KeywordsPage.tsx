import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, ExternalLink, Type, Sparkles, Copy, Check } from "lucide-react";
import { ErrorBanner, EmptyState, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { keywordSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

const POPULAR_KEYWORDS = [
  "Python Automation Scripts",
  "React 19 Server Actions",
  "Next.js 15 Full Course",
  "System Design Interview Prep",
  "Best AI Tools 2026",
  "Docker & Kubernetes Tutorial",
];

export default function KeywordsPage() {
  const [keywords, setKeywords] = useAppState("keywords");
  const [topic, setTopic] = useState("");
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { loading, error, clearError, run } = useTask();
  const navigate = useNavigate();

  // Debounced real-time YouTube Autocomplete Suggestions (100% Free API)
  const handleTopicChange = async (val: string) => {
    setTopic(val);
    if (!val.trim() || val.length < 2) {
      setLiveSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/youtube/suggest?q=${encodeURIComponent(val.trim())}`);
      if (res.ok) {
        const data = (await res.json()) as { suggestions?: string[] };
        setLiveSuggestions(data.suggestions || []);
      }
    } catch {
      // Non-blocking
    }
  };

  const research = async (topicToUse?: string) => {
    const targetTopic = topicToUse || topic;
    if (!targetTopic.trim()) return;

    await run(async () => {
      const parsed = await generateJSON(keywordSchema.array().min(1).max(12), {
        useWebSearch: true,
        system:
          'Search the web for real search behavior around this topic, then list keywords. Respond with ONLY a JSON array of 6 objects: [{"keyword":"string","intent":"Informational"|"Comparison"|"Tutorial"|"Commercial","difficulty":"Low"|"Medium"|"High","opportunity":number}]',
        prompt: `Topic: ${targetTopic}\n\nResearch real YouTube/Google search keywords for this topic.`,
      });
      setKeywords(withIds(parsed));
    });
  };

  const tone = (d: string) => (d === "Low" ? "mint" : d === "Medium" ? "amber" : "red") as "mint" | "amber" | "red";

  const openYouTubeSearch = (kw: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(kw)}`, "_blank");
  };

  const generateTitles = (kw: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/titles", { state: { topic: kw } });
  };

  const generatePackage = (kw: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/package", { state: { topic: kw } });
  };

  const copyKeyword = (kw: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(kw);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Keyword Research
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Discover high-opportunity search terms with real-time YouTube intent & demand
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div className="search-bar-row" style={{ marginBottom: 12 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
            placeholder="Enter a topic, e.g. Java DSA interview prep, Next.js, AI workflows..."
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && research()}
          />
          <button className="btn" onClick={() => research()} disabled={loading || !topic.trim()} style={{ padding: "10px 20px" }}>
            {loading ? <Loader2 size={14} className="spin" /> : <KeyRound size={14} />} Research
          </button>
        </div>

        {/* Live YouTube Search Suggestions (Free Real-Time API) */}
        {liveSuggestions.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 14,
              padding: "10px 14px",
              background: "rgba(56, 189, 248, 0.06)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "var(--radius-md)",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--accent-primary, #38bdf8)", fontWeight: 700, letterSpacing: "0.05em" }}>
              LIVE YOUTUBE DEMAND:
            </span>
            {liveSuggestions.slice(0, 6).map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  setTopic(sug);
                  research(sug);
                }}
                style={{
                  fontSize: 11.5,
                  padding: "3px 9px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Popular Presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontWeight: 600 }}>TRENDING TOPICS:</span>
          {POPULAR_KEYWORDS.map((k) => (
            <button
              key={k}
              onClick={() => {
                setTopic(k);
                research(k);
              }}
              style={{
                fontSize: 11.5,
                padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              +{k}
            </button>
          ))}
        </div>


        <ErrorBanner message={error} onRetry={clearError} />
        {keywords.length === 0 && !loading && <EmptyState text="Enter a topic above to research real keywords." />}
        {loading && <EmptyState text="Querying live search intent and competitor difficulty..." />}

        {keywords.length > 0 && (
          <div className="grid-auto" style={{ gap: 14 }}>
            {keywords.map((k) => (
              <div
                key={k.id}
                className="hover-card"
                style={{
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                    {k.keyword}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Pill>{k.intent}</Pill>
                    <Pill tone={tone(k.difficulty)}>{k.difficulty} Comp</Pill>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--accent-mint, #34d399)",
                        marginLeft: "auto",
                      }}
                    >
                      {k.opportunity}/100 Opp.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={(e) => openYouTubeSearch(k.keyword, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={11} /> Search
                  </button>

                  <button
                    onClick={(e) => generateTitles(k.keyword, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "var(--accent-primary, #38bdf8)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Type size={11} /> Titles & CTR
                  </button>

                  <button
                    onClick={(e) => generatePackage(k.keyword, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <Sparkles size={11} /> Package
                  </button>

                  <button
                    onClick={(e) => copyKeyword(k.keyword, k.id, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    {copiedId === k.id ? <Check size={11} color="var(--accent-mint)" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}