import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, ExternalLink, Sparkles, FileText, Type, Copy, Check, Search } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState, SignalMeter, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { trendSchema } from "../lib/schemas";
import { getSourceIcon } from "../lib/icons";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";

const SUGGESTED_NICHES = [
  "AI Tools & Automation",
  "Coding & Web Dev",
  "Tech Reviews & Gadgets",
  "Gaming & Walkthroughs",
  "Personal Finance & Crypto",
  "Productivity & Workflow",
];

export default function TrendsPage() {
  const { state, setState } = useStore();
  const [trends, setTrends] = useAppState("trends");
  const [customNiche, setCustomNiche] = useState(state.niche || "AI Tools & Technology");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTrendId, setActiveTrendId] = useState<string | null>(null);
  const { loading, error, clearError, run } = useTask();
  const navigate = useNavigate();

  const refresh = async (nicheToUse?: string) => {
    const targetNiche = nicheToUse || customNiche || state.niche || "AI Tools & Technology";
    setState({ niche: targetNiche });

    await run(async () => {
      const parsed = await generateJSON(trendSchema.array().min(1).max(12), {
        useWebSearch: true,
        system:
          "You are a YouTube trend research assistant. Search the web for genuinely current trending topics relevant to the given niche. After searching, respond with ONLY a JSON array of exactly 5 objects with this shape: [{\"topic\":\"string\",\"source\":\"GitHub Trending|Reddit|Hacker News|Product Hunt|YouTube|Web\",\"score\":number,\"growth\":number,\"competition\":\"Low\"|\"Medium\"|\"High\",\"format\":\"string\",\"length\":\"string\"}]",
        prompt: `Niche: ${targetNiche}\n\nFind 5 real, currently trending topics for this niche and score them.`,
      });
      setTrends(withIds(parsed));
    });
  };

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openYouTubeSearch = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`, "_blank");
  };

  const goToPackage = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/package", { state: { topic } });
  };

  const goToScript = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/script", { state: { topic } });
  };

  const goToTitles = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/titles", { state: { topic } });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Trend Discovery
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Live web & YouTube search for trending topics with real-time analytics
        </p>
      </div>

      {/* Topic Search & Niche Filter Bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)" }}>
        <div className="search-bar-row" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 240px)" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              className="input"
              style={{ width: "100%", paddingLeft: 36, fontSize: 13.5 }}
              placeholder="Search or enter your channel niche (e.g. AI Tools, Python, Next.js)..."
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refresh(customNiche)}
            />
          </div>
          <button
            className="btn"
            onClick={() => refresh(customNiche)}
            disabled={loading || !customNiche.trim()}
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} {loading ? "Searching..." : "Search Trends"}
          </button>
        </div>

        {/* Quick presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-dim)", marginRight: 4, fontWeight: 600 }}>QUICK NICHES:</span>
          {SUGGESTED_NICHES.map((n) => (
            <button
              key={n}
              onClick={() => {
                setCustomNiche(n);
                refresh(n);
              }}
              style={{
                fontSize: 11.5,
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: customNiche === n ? "var(--accent-primary-dim, rgba(56, 189, 248, 0.15))" : "var(--surface-2)",
                border: "1px solid var(--border)",
                color: customNiche === n ? "var(--accent-primary, #38bdf8)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <PanelCard
          title="Trending right now"
          eyebrow="Live Intelligence Engine (Real-Time YouTube & Web Data)"
          actions={
            <button className="btn btn-ghost btn-sm" onClick={() => refresh(customNiche)} disabled={loading}>
              {loading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />} {loading ? "Searching..." : "Refresh"}
            </button>
          }
        >
          <ErrorBanner message={error} onRetry={clearError} />
          {trends.length === 0 && !loading && (
            <EmptyState text="No trends loaded yet — type a niche above and click Search Trends to fetch live data." />
          )}
          {loading && <EmptyState text="Querying live YouTube & web data for current trending topics..." />}

          {trends.map((t) => {
            const Icon = getSourceIcon(t.source);
            const tone = t.competition === "Low" ? "mint" : t.competition === "Medium" ? "amber" : "red";
            const isExpanded = activeTrendId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setActiveTrendId(isExpanded ? null : t.id)}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: isExpanded ? "var(--surface-2)" : "transparent",
                  marginBottom: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                className="hover-card"
              >
                {/* Main Summary Row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <div
                    style={{
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-sm)",
                      padding: 8,
                      flexShrink: 0,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Icon size={16} color="var(--text-muted)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                      {t.topic}
                    </div>
                    <div className="muted" style={{ fontSize: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "var(--accent-mint, #34d399)", fontWeight: 600 }}>+{t.growth}% growth</span>
                      <span>·</span>
                      <span>{t.source}</span>
                      <span>·</span>
                      <span>{t.format}</span>
                      <span>·</span>
                      <span>{t.length}</span>
                    </div>
                  </div>

                  <Pill tone={tone}>{t.competition} Comp</Pill>
                  <SignalMeter value={t.score} tone="amber" />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, width: 28, textAlign: "right", fontWeight: 700 }}>
                    {t.score}
                  </div>
                </div>

                {/* Quick Action Toolbar (Clickable) */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    paddingTop: 8,
                    borderTop: "1px solid var(--border)",
                    marginTop: 4,
                  }}
                >
                  <button
                    onClick={(e) => openYouTubeSearch(t.topic, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 11px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={12} /> Watch on YouTube
                  </button>

                  <button
                    onClick={(e) => goToPackage(t.topic, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 11px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "var(--accent-primary, #38bdf8)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={12} /> Create Full Package
                  </button>

                  <button
                    onClick={(e) => goToScript(t.topic, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 11px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <FileText size={12} /> Write Script
                  </button>

                  <button
                    onClick={(e) => goToTitles(t.topic, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 11px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <Type size={12} /> Generate Titles & CTR
                  </button>

                  <button
                    onClick={(e) => copyToClipboard(t.topic, t.id, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 11px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    {copiedId === t.id ? <Check size={12} color="var(--accent-mint)" /> : <Copy size={12} />}
                    {copiedId === t.id ? "Copied!" : "Copy Topic"}
                  </button>
                </div>
              </div>
            );
          })}
        </PanelCard>
      </div>
    </div>
  );
}