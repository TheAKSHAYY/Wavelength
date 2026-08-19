import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, Target, ExternalLink, FileText } from "lucide-react";
import { ErrorBanner, EmptyState, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { ideaSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function IdeasPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedTopic = (location.state as { topic?: string })?.topic || "";

  const [ideas, setIdeas] = useAppState("ideas");
  const [topic, setTopic] = useState(passedTopic || "");
  const { loading, error, clearError, run } = useTask();

  useEffect(() => {
    if (passedTopic && passedTopic !== topic) {
      setTopic(passedTopic);
    }
  }, [passedTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    const trendContext = ideas.length ? `Already-generated ideas: ${ideas.map((i) => i.title).join(", ")}.` : "";
    await run(async () => {
      const parsed = await generateJSON(ideaSchema.array().min(1).max(9), {
        system:
          'Generate YouTube video ideas optimized for virality and search demand. Respond with ONLY a JSON array, no markdown fences: [{"title":"string","viral":number,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string"}]',
        prompt: `Topic/niche: ${topic}\n${trendContext}\n\nGenerate 3 YouTube video ideas based on real audience interest.`,
      });
      setIdeas([...withIds(parsed), ...ideas].slice(0, 9));
    });
  };

  const openYouTubeSearch = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`, "_blank");
  };

  const createPackage = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/package", { state: { topic: title } });
  };

  const writeScript = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/script", { state: { topic: title } });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Idea Generator
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          AI-powered video concepts with virality and demand analysis
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div className="search-bar-row" style={{ marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
            placeholder="Enter a topic, e.g. Spring Boot vs FastAPI, AI Agent development..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button className="btn" onClick={generate} disabled={loading || !topic.trim()} style={{ padding: "10px 22px" }}>
            {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Generate Ideas
          </button>
        </div>

        <ErrorBanner message={error} onRetry={clearError} />
        {ideas.length === 0 && !loading && <EmptyState text="Enter a topic above and generate real ideas." />}
        {loading && <EmptyState text="Analyzing YouTube topics and generating viral video concepts..." />}

        <div className="grid-auto" style={{ gap: 14 }}>
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="card card-interactive hover-card"
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Pill tone="violet">Viral Score: {idea.viral}/100</Pill>
                  <Target size={14} color="var(--text-dim)" />
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.4, marginBottom: 8, fontFamily: "var(--font-display)", fontWeight: 600 }}>
                  {idea.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                  🎯 <strong>Audience:</strong> {idea.audience}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                  <span>Demand: <strong>{idea.demand}</strong></span>
                  <span>Difficulty: <strong>{idea.difficulty}</strong></span>
                </div>
              </div>

              {/* Action Toolbar */}
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
                  onClick={(e) => openYouTubeSearch(idea.title, e)}
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
                  onClick={(e) => createPackage(idea.title, e)}
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
                  <Sparkles size={11} /> Full Package
                </button>

                <button
                  onClick={(e) => writeScript(idea.title, e)}
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
                  <FileText size={11} /> Script
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}