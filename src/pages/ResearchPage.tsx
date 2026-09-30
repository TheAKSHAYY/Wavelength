import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Key,
  Layers,
  Loader2,
  Target,
  Zap,
  Flame,
  Users,
} from "lucide-react";
import { generateJSON } from "../lib/ai";
import { useTask } from "../lib/hooks";
import { useStore } from "../lib/store";
import { ErrorBanner } from "../components/SharedUI";
import ProjectWorkflowBar from "../components/ProjectWorkflowBar";
import { z } from "zod";

const str = (fallback = "") =>
  z.preprocess(
    (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : fallback),
    z.string()
  );

const researchOverviewSchema = z.object({
  topic: str(),
  niche: str("General"),
  audience: str("Creators & Tech Learners"),
  intent: str("Educational & Strategic"),
  contentOpportunity: str("High demand topic with strong breakout potential."),
  burningQuestions: z.array(
    z.preprocess((v) => (typeof v === "string" ? v.trim() : typeof v === "object" && v && "question" in v ? String((v as any).question) : String(v || "")), z.string())
  ).default([]),
  keywords: z.array(
    z.object({
      term: str(),
      volume: str("Medium"),
      competition: str("Medium"),
      intent: str("Informational"),
    })
  ).default([]),
  contentGaps: z.array(
    z.preprocess((v) => (typeof v === "string" ? v.trim() : typeof v === "object" && v && "gap" in v ? String((v as any).gap) : String(v || "")), z.string())
  ).default([]),
  trends: z.array(
    z.object({
      trendAngle: str(),
      whyRising: str("Growing search demand"),
      formatFit: str("Short"),
    })
  ).default([]),
  competitorGaps: z.array(
    z.object({
      competitorFlaw: str("Outdated generic explanations"),
      yourWinningAngle: str("Clear practical modern breakdown"),
    })
  ).default([]),
  fiveVideoRoadmap: z.array(
    z.object({
      videoNumber: z.preprocess((v) => {
        const n = Number(String(v || "").replace(/[^0-9]/g, ""));
        return isNaN(n) || n === 0 ? 1 : n;
      }, z.number()),
      title: str(),
      hook: str(),
      angle: str(),
    })
  ).default([]),
});

type ResearchOverview = z.infer<typeof researchOverviewSchema>;

export default function ResearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, createProject, setCurrentProject, saveIdea } = useStore();
  const state = (location.state || {}) as { topic?: string };

  const [topic, setTopic] = useState(state.topic || user?.niche || "AI Agents for Beginners");
  const [data, setData] = useState<ResearchOverview | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "trends" | "competitors" | "roadmap">("overview");
  const [savedIdeasMap, setSavedIdeasMap] = useState<Record<string, boolean>>({});

  const { loading, error, clearError, run } = useTask();

  const analyzeTopic = async (topicToAnalyze?: string) => {
    const target = (topicToAnalyze || topic).trim();
    if (!target) return;

    clearError();
    await run(async () => {
      const parsed = await generateJSON(researchOverviewSchema, {
        system: `You are Wavelength Research AI, an expert YouTube market researcher.
Analyze the user's topic and output ONLY valid JSON matching this schema:
{
  "topic": "string",
  "niche": "string",
  "audience": "string",
  "intent": "string",
  "contentOpportunity": "string",
  "burningQuestions": ["string", "string", "string"],
  "keywords": [
    { "term": "string", "volume": "High|Medium|Low", "competition": "Low|Medium|High", "intent": "string" }
  ],
  "contentGaps": ["string", "string"],
  "trends": [
    { "trendAngle": "string", "whyRising": "string", "formatFit": "Short|Long-Form" }
  ],
  "competitorGaps": [
    { "competitorFlaw": "string", "yourWinningAngle": "string" }
  ],
  "fiveVideoRoadmap": [
    { "videoNumber": 1, "title": "string", "hook": "string", "angle": "string" },
    { "videoNumber": 2, "title": "string", "hook": "string", "angle": "string" },
    { "videoNumber": 3, "title": "string", "hook": "string", "angle": "string" },
    { "videoNumber": 4, "title": "string", "hook": "string", "angle": "string" },
    { "videoNumber": 5, "title": "string", "hook": "string", "angle": "string" }
  ]
}
Never include Markdown code fences outside JSON. Never default to coding examples unless the topic is specifically programming.`,
        prompt: `Topic to Research: "${target}"\nCreator Niche: "${user?.niche || "General"}"\nTarget Audience: "${user?.target_audience || "General"}"\n\nReturn complete YouTube market research overview JSON for this topic.`,
        useWebSearch: true,
      });
      setData(parsed);
    });
  };

  useEffect(() => {
    if (state.topic) {
      setTopic(state.topic);
      analyzeTopic(state.topic);
    }
  }, [state.topic]);

  const handleCreateProjectFromAngle = (title: string, angle?: string, type: "Short" | "Thumbnail" | "Full Video" = "Short") => {
    const proj = createProject({
      title,
      topic: topic || title,
      contentType: type,
      research: {
        topic: topic || title,
        angle: angle || data?.contentOpportunity,
        summary: data?.contentOpportunity,
        burningQuestions: data?.burningQuestions,
        contentGaps: data?.contentGaps,
      },
      targetAudience: data?.audience || user?.target_audience,
      progressPercent: 30,
      status: "Researching",
    });

    setCurrentProject(proj.id);

    if (type === "Short") {
      navigate("/shorts", { state: { projectId: proj.id, topic: proj.topic, title: proj.title, angle } });
    } else if (type === "Thumbnail") {
      navigate("/packaging", { state: { projectId: proj.id, topic: proj.topic, title: proj.title, angle } });
    } else {
      navigate("/script", { state: { projectId: proj.id, topic: proj.topic, title: proj.title, angle } });
    }
  };

  const handleSaveIdea = (title: string) => {
    saveIdea({
      id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      viral: 85,
      demand: "High",
      difficulty: "Medium",
      audience: data?.audience || "YouTube Viewers",
    });
    setSavedIdeasMap((prev) => ({ ...prev, [title]: true }));
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Workflow Stepper Bar (if active project) */}
      <ProjectWorkflowBar
        currentPhase="research"
        onNextPhase={() => {
          if (data?.topic) {
            handleCreateProjectFromAngle(data.fiveVideoRoadmap[0]?.title || data.topic, data.fiveVideoRoadmap[0]?.angle, "Full Video");
          } else {
            navigate("/packaging");
          }
        }}
        nextPhaseLabel="Packaging Studio →"
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: "0 0 4px 0" }}>
            Topic & Competitor Research
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Discover high-demand content opportunities, keywords, and competitor gaps to build your next video
          </p>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {/* Topic Input Bar */}
      <div
        className="card"
        style={{
          padding: "clamp(16px, 3vw, 22px)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeTopic()}
              placeholder="Enter any niche, topic, or search term (e.g. AI Agents, Indian Street Food, Java DSA, Fitness)..."
              style={{ width: "100%", paddingLeft: 38, fontSize: 14 }}
              disabled={loading}
            />
          </div>
          <button
            onClick={() => analyzeTopic()}
            disabled={loading || !topic.trim()}
            className="btn btn-primary"
            style={{ padding: "8px 20px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="spin" /> Analyzing Signals…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Analyze Topic
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Level Strategic Summary Card */}
          <div
            className="card"
            style={{
              padding: "clamp(18px, 3vw, 24px)",
              background: "radial-gradient(ellipse at 90% 0%, rgba(56, 189, 248, 0.06) 0%, var(--surface) 80%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={18} color="var(--accent-primary, #38bdf8)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Topic Overview & Opportunity</h3>
              </div>
              <button
                onClick={() => handleCreateProjectFromAngle(data.fiveVideoRoadmap[0]?.title || topic, data.contentOpportunity, "Short")}
                className="btn btn-primary"
                style={{ fontSize: 12.5, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Launch Project from this Topic <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Audience</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{data.audience}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Search Intent</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{data.intent}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Niche Category</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-primary, #38bdf8)", marginTop: 4 }}>{data.niche}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.25)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-mint, #34d399)", textTransform: "uppercase", marginBottom: 2 }}>
                Key Content Opportunity
              </div>
              <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {data.contentOpportunity}
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8, overflowX: "auto" }}>
            {[
              { id: "overview", label: "Questions & Gaps" },
              { id: "keywords", label: "Keywords & Volume" },
              { id: "trends", label: "Rising Trend Angles" },
              { id: "competitors", label: "Competitor Teardown" },
              { id: "roadmap", label: "5-Video Series Roadmap" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                  background: activeTab === tab.id ? "rgba(56, 189, 248, 0.1)" : "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary, #38bdf8)" : "none",
                  borderRadius: "4px 4px 0 0",
                  padding: "8px 14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview Questions & Gaps */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <HelpCircle size={16} color="var(--accent-primary, #38bdf8)" />
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>Top Audience Burning Questions</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.burningQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: "var(--surface-2)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ flex: 1 }}>{q}</span>
                      <button
                        onClick={() => handleCreateProjectFromAngle(q, "Burning audience question", "Short")}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Short
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Zap size={16} color="var(--accent-amber, #fbbf24)" />
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>Underserved Content Gaps</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.contentGaps.map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: "var(--surface-2)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ flex: 1 }}>{g}</span>
                      <button
                        onClick={() => handleCreateProjectFromAngle(g, "Content gap opportunity", "Thumbnail")}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: "rgba(245, 158, 11, 0.15)",
                          color: "#f59e0b",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Keywords */}
          {activeTab === "keywords" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Key size={16} color="#a78bfa" />
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>High-Demand Keyword Signals</h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {data.keywords.map((kw, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{kw.term}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                        {kw.volume} Volume
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      Competition: <strong>{kw.competition}</strong> • Intent: {kw.intent}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <button
                        onClick={() => handleCreateProjectFromAngle(kw.term, `Keyword: ${kw.term}`, "Short")}
                        style={{
                          flex: 1,
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: "5px 8px",
                          borderRadius: 4,
                          background: "rgba(56, 189, 248, 0.12)",
                          color: "#38bdf8",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        + Create Short
                      </button>
                      <button
                        onClick={() => handleSaveIdea(kw.term)}
                        style={{
                          padding: "5px 8px",
                          fontSize: 11.5,
                          borderRadius: 4,
                          background: "var(--surface-1)",
                          color: savedIdeasMap[kw.term] ? "#34d399" : "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                      >
                        {savedIdeasMap[kw.term] ? "Saved ✓" : "Save"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Trends */}
          {activeTab === "trends" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Flame size={16} color="#f59e0b" />
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Rising Opportunities & Angles</h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                {data.trends.map((tr, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{tr.trendAngle}</div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>{tr.whyRising}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Format: {tr.formatFit}</span>
                      <button
                        onClick={() => handleCreateProjectFromAngle(tr.trendAngle, tr.whyRising, tr.formatFit === "Long-Form" ? "Full Video" : "Short")}
                        className="btn-primary"
                        style={{ padding: "5px 12px", fontSize: 11.5, fontWeight: 600, borderRadius: 4 }}
                      >
                        Launch Project →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Competitor Gaps */}
          {activeTab === "competitors" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Users size={16} color="#34d399" />
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Competitor Teardowns & Winning Angles</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.competitorGaps.map((cg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase" }}>
                        What Competitors Do Wrong:
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{cg.competitorFlaw}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginTop: 8 }}>
                        Your Winning Angle:
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{cg.yourWinningAngle}</div>
                    </div>

                    <button
                      onClick={() => handleCreateProjectFromAngle(cg.yourWinningAngle, "Competitor counter-angle", "Short")}
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 4 }}
                    >
                      Use Winning Angle →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: 5-Video Series Roadmap */}
          {activeTab === "roadmap" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Layers size={16} color="var(--accent-primary, #38bdf8)" />
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>5-Video Series Production Roadmap</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.fiveVideoRoadmap.map((v) => (
                  <div
                    key={v.videoNumber}
                    style={{
                      padding: 16,
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 14,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "var(--accent-primary, #38bdf8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {v.videoNumber}
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>{v.title}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                          Hook: "{v.hook}"
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 2 }}>Angle: {v.angle}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleCreateProjectFromAngle(v.title, v.angle, "Short")}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 4,
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        + Short
                      </button>
                      <button
                        onClick={() => handleCreateProjectFromAngle(v.title, v.angle, "Thumbnail")}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 4,
                          background: "rgba(245, 158, 11, 0.15)",
                          color: "#f59e0b",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        + Package
                      </button>
                      <button
                        onClick={() => handleCreateProjectFromAngle(v.title, v.angle, "Full Video")}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 4,
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#a855f7",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        + Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
