import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import { z } from "zod";

const richIdeaSchema = z.object({
  title: z.string(),
  whyThisIdea: z.string(),
  contentAngle: z.string(),
  hook: z.string(),
  opportunity: z.enum(["High", "Medium", "Low"]),
  category: z.enum(["Recommended", "Trending", "Untapped"]),
  audience: z.string(),
  format: z.string(),
  keyPoints: z.array(z.string()).min(3),
  differentiation: z.string(),
});

type RichIdea = z.infer<typeof richIdeaSchema> & { id?: string; isSaved?: boolean };

export default function IdeasPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedState = (location.state || {}) as { topic?: string; angle?: string; opportunity?: string };

  const [ideas, setIdeas] = useAppState("ideas");
  const [topic, setTopic] = useState(passedState.topic || "AI Agents for Beginners");
  const [filter, setFilter] = useState<"All" | "Recommended" | "Trending" | "Untapped" | "Saved">("All");
  const [selectedIdea, setSelectedIdea] = useState<RichIdea | null>(null);

  const { loading, error, clearError, run } = useTask();

  const generate = async (topicToUse?: string) => {
    const target = (topicToUse || topic).trim();
    if (!target) return;

    clearError();
    await run(async () => {
      const parsed = await generateJSON(richIdeaSchema.array().min(3).max(6), {
        system: `You are Wavelength Idea Strategist. Generate high-opportunity, strategic YouTube video concepts.
Output ONLY a valid JSON array of objects (no markdown outside JSON, no conversational text) matching this schema:
[
  {
    "title": "string (Punchy, high-CTR video title)",
    "whyThisIdea": "string (1-2 sentence strategic explanation)",
    "contentAngle": "string (Unique premise or perspective)",
    "hook": "string (Opening 0-15s verbal pattern interrupt)",
    "opportunity": "High" | "Medium" | "Low",
    "category": "Recommended" | "Trending" | "Untapped",
    "audience": "string (Target viewer profile)",
    "format": "string (e.g. Breakdown, Deep Dive, Code Audit, Case Study)",
    "keyPoints": ["string", "string", "string", "string"],
    "differentiation": "string (What makes this stand out from existing videos)"
  }
]`,
        prompt: `Topic / Goal: "${target}"\n\nGenerate 4-5 structured video concepts JSON array for this topic.`,
      });
      setIdeas(withIds(parsed) as any);
    });
  };

  useEffect(() => {
    if (passedState.topic) {
      setTopic(passedState.topic);
      generate(passedState.topic);
    }
  }, [passedState.topic]);

  const toggleSaveIdea = (ideaItem: RichIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = ((ideas as unknown as RichIdea[]) || []).map((item) =>
      item.title === ideaItem.title ? { ...item, isSaved: !item.isSaved } : item
    );
    setIdeas(updated as any);
  };

  const handleBuildPackage = (ideaToPackage: RichIdea) => {
    navigate("/packaging", {
      state: {
        title: ideaToPackage.title,
        topic: ideaToPackage.title,
        angle: ideaToPackage.contentAngle,
        hook: ideaToPackage.hook,
        keyPoints: ideaToPackage.keyPoints,
        audience: ideaToPackage.audience,
      },
    });
  };

  const filteredIdeas = ((ideas as unknown as RichIdea[]) || []).filter((item) => {
    if (filter === "All") return true;
    if (filter === "Saved") return item.isSaved;
    return item.category === filter;
  });

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-primary, #38bdf8)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
          CREATE · STRATEGIC IDEATION
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
          Content Ideas & Concepts
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          Transform topics into strategic, audience-tested video concepts with differentiated angles and proven hooks.
        </p>
      </div>

      {/* Input bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 260, fontSize: 14 }}
            placeholder="Enter a topic or niche (e.g. AI Agents, Java DSA, Fitness for Beginners, Street Food)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            disabled={loading}
          />
          <button
            onClick={() => generate()}
            disabled={loading || !topic.trim()}
            className="btn btn-primary"
            style={{ padding: "8px 20px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />} Generate Strategic Ideas
          </button>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {(["All", "Recommended", "Trending", "Untapped", "Saved"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: filter === cat ? 700 : 500,
              color: filter === cat ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
              borderBottom: filter === cat ? "2px solid var(--accent-primary, #38bdf8)" : "none",
              borderRadius: 0,
              padding: "6px 12px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {ideas.length === 0 && !loading && (
        <EmptyState text="Enter a topic above and click 'Generate Strategic Ideas' to discover breakthrough concepts." />
      )}

      {/* Ideas Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 540px), 1fr))", gap: 16 }}>
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id || idea.title}
            onClick={() => setSelectedIdea(idea)}
            className="card hover-lift"
            style={{
              padding: "clamp(18px, 3vw, 24px)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(56, 189, 248, 0.15)",
                      color: "var(--accent-primary, #38bdf8)",
                    }}
                  >
                    {idea.category || "Recommended"}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    Opportunity: <strong style={{ color: "var(--accent-mint)" }}>{idea.opportunity || "High"}</strong>
                  </span>
                </div>

                <button
                  onClick={(e) => toggleSaveIdea(idea, e)}
                  className="icon-btn"
                  style={{ width: 28, height: 28 }}
                  title={idea.isSaved ? "Saved" : "Save Idea"}
                >
                  {idea.isSaved ? <BookmarkCheck size={16} color="var(--accent-mint)" /> : <Bookmark size={16} />}
                </button>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px 0" }}>{idea.title}</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginTop: 10 }}>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  <strong style={{ color: "var(--text-primary)" }}>Why this idea: </strong>
                  {idea.whyThisIdea}
                </div>

                <div style={{ background: "var(--surface-2)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                  <strong style={{ color: "var(--accent-primary, #38bdf8)" }}>Angle: </strong>
                  <span style={{ color: "var(--text-secondary)" }}>{idea.contentAngle}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Format: {idea.format || "Deep Dive"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIdea(idea);
                }}
                className="btn btn-ghost"
                style={{ fontSize: 12.5, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Develop Idea <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Idea Detail Modal Drawer */}
      {selectedIdea && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "clamp(20px, 4vw, 32px)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "var(--accent-primary, #38bdf8)",
                  }}
                >
                  IDEA DETAIL & SPECIFICATION
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 0 0" }}>{selectedIdea.title}</h2>
              </div>
              <button onClick={() => setSelectedIdea(null)} className="icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>OPPORTUNITY</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-mint)" }}>{selectedIdea.opportunity}</div>
              </div>
              <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>AUDIENCE</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedIdea.audience || "General"}</div>
              </div>
              <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>FORMAT</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedIdea.format || "Breakdown"}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13.5 }}>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Why this idea:</strong>
                <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0", lineHeight: 1.5 }}>
                  {selectedIdea.whyThisIdea}
                </p>
              </div>

              <div>
                <strong style={{ color: "var(--text-primary)" }}>Content Angle:</strong>
                <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0", lineHeight: 1.5 }}>
                  {selectedIdea.contentAngle}
                </p>
              </div>

              <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: 12, borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--accent-amber, #fbbf24)" }}>Opening Hook (0–15s):</strong>
                <p style={{ color: "var(--text-primary)", margin: "4px 0 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
                  "{selectedIdea.hook}"
                </p>
              </div>

              <div>
                <strong style={{ color: "var(--text-primary)" }}>Key Takeaways & Structure:</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {(selectedIdea.keyPoints || []).map((pt, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--accent-primary, #38bdf8)", fontWeight: 700 }}>0{idx + 1}.</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIdea.differentiation && (
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Differentiation:</strong>
                  <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0", lineHeight: 1.5 }}>
                    {selectedIdea.differentiation}
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setSelectedIdea(null)} className="btn btn-ghost">
                Close
              </button>
              <button
                onClick={() => handleBuildPackage(selectedIdea)}
                className="btn btn-primary"
                style={{ padding: "8px 20px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Build Content Package <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}