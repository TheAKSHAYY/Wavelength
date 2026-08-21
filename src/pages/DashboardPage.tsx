import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Clapperboard,
  Layers,
  FileText,
  Clock,
  FolderGit2,
  Bookmark,
  Plus,
  Play,
} from "lucide-react";
import { useStore } from "../lib/store";
import { greeting } from "../lib/format";
import type { Project, ProjectType, ProjectStatus } from "../types";

const QUICK_EXAMPLES = [
  "Java DSA Roadmap in 2026",
  "Why BCA Students Struggle With Internships",
  "How Black Holes Work",
  "Indian Street Food Secrets",
  "Best Gaming PC Under $1000",
  "Why Your React App Is Slow",
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, state, createProject, setCurrentProject } = useStore();
  const [topicInput, setTopicInput] = useState("");

  const projects = useMemo(() => state.projects || [], [state.projects]);
  const savedIdeas = useMemo(() => state.savedIdeas || [], [state.savedIdeas]);
  const latestProject = useMemo(() => projects[0] || null, [projects]);

  // Quick Create handlers
  const handleQuickCreate = (type: ProjectType, customTopic?: string) => {
    const raw = (customTopic || topicInput).trim();
    const defaultTitle = raw || (type === "Short" ? "New Short Video" : type === "Thumbnail" ? "New Thumbnail Blueprint" : "New Full Video Script");

    const created = createProject({
      title: defaultTitle,
      topic: raw || defaultTitle,
      contentType: type,
      language: "English",
      tone: user?.tone || "Direct & Punchy",
      targetAudience: user?.target_audience || "YouTube Viewers",
    });

    setCurrentProject(created.id);

    if (type === "Short") {
      navigate("/shorts", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    } else if (type === "Thumbnail") {
      navigate("/packaging", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    } else {
      navigate("/script", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    }
  };

  const handleContinueProject = (project: Project) => {
    setCurrentProject(project.id);
    if (project.contentType === "Short") {
      navigate("/shorts", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else if (project.contentType === "Thumbnail") {
      navigate("/packaging", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else {
      navigate("/script", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    }
  };

  // Pipeline stage counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      Draft: 0,
      Researching: 0,
      Writing: 0,
      Packaged: 0,
      "Ready to Record": 0,
      Published: 0,
    };
    projects.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [projects]);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1200, margin: "0 auto" }}>
      {/* Top Greeting & Creator Memory Context */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--accent-primary, #38bdf8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            CREATOR PRE-PRODUCTION WORKSPACE
          </div>
          <h1 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            {greeting(user?.name || "Creator")}.
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14.5 }}>
            Turn your raw ideas into audience-aware, production-ready video blueprints before you record.
          </p>
        </div>

        {/* Active Profile Context Badge */}
        <div
          onClick={() => navigate("/profile")}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
            borderRadius: "var(--radius-lg)",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            transition: "border-color 0.15s ease",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#34d399",
              boxShadow: "0 0 8px #34d399",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", fontSize: 11.5 }}>
            <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>Master Creator Memory</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {user?.niche ? user.niche.slice(0, 24) : "Tech & Education"} • {user?.target_audience ? "Audience Aware" : "Default"}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "var(--accent-primary, #38bdf8)", fontWeight: 600, marginLeft: 4 }}>
            Edit
          </span>
        </div>
      </div>

      {/* SECTION 1: "What are you creating?" — Quick Create Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="var(--accent-primary, #38bdf8)" />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            What are you creating?
          </h2>
        </div>

        {/* 3 Main Action Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {/* Card 1: Create a Short */}
          <div
            onClick={() => handleQuickCreate("Short")}
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(56, 189, 248, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                }}
              >
                <Clapperboard size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                VERTICAL 9:16
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                Create a Short
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                Hooks, word-budgeted voiceover, scene-by-scene editing timeline, and production prompts.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#38bdf8", marginTop: "auto" }}>
              <span>Launch Shorts Studio</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Create a Thumbnail */}
          <div
            onClick={() => handleQuickCreate("Thumbnail")}
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f59e0b",
                }}
              >
                <Layers size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                16:9 PACKAGING
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                Create a Thumbnail
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                10-framework psychological titles paired with high-CTR synchronized visual concepts and typography.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#f59e0b", marginTop: "auto" }}>
              <span>Launch Thumbnail Studio</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 3: Create Full Video */}
          <div
            onClick={() => handleQuickCreate("Full Video")}
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(168, 85, 247, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a855f7",
                }}
              >
                <FileText size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                LONG-FORM SCRIPT
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                Create Full Video
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                Retention-optimized script outline, spoken voiceover, visual cues, and chapter structure.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#a855f7", marginTop: "auto" }}>
              <span>Launch Long-Form Studio</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Quick Topic Input Bar */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
            borderRadius: "var(--radius-lg)",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder='Type an idea or topic (e.g. "Java DSA Roadmap in 2026")...'
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && topicInput.trim()) {
                  handleQuickCreate("Short", topicInput);
                }
              }}
              style={{
                flex: 1,
                minWidth: 260,
                padding: "10px 14px",
                background: "var(--bg-surface-2, #1f2937)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13.5,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleQuickCreate("Short")}
                disabled={!topicInput.trim()}
                className="btn-primary"
                style={{ padding: "9px 14px", fontSize: 12.5, fontWeight: 600, borderRadius: "var(--radius-md)" }}
              >
                + Short
              </button>
              <button
                onClick={() => handleQuickCreate("Thumbnail")}
                disabled={!topicInput.trim()}
                style={{
                  padding: "9px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  cursor: topicInput.trim() ? "pointer" : "not-allowed",
                  opacity: topicInput.trim() ? 1 : 0.5,
                }}
              >
                + Thumbnail
              </button>
              <button
                onClick={() => handleQuickCreate("Full Video")}
                disabled={!topicInput.trim()}
                style={{
                  padding: "9px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#a855f7",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  cursor: topicInput.trim() ? "pointer" : "not-allowed",
                  opacity: topicInput.trim() ? 1 : 0.5,
                }}
              >
                + Script
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontWeight: 600 }}>Quick topics:</span>
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setTopicInput(ex);
                  handleQuickCreate("Short", ex);
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                  borderRadius: "var(--radius-full)",
                  padding: "3px 10px",
                  fontSize: 11.5,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Continue Working */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={17} color="var(--accent-primary, #38bdf8)" />
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Continue where you left off
            </h2>
          </div>
          {projects.length > 0 && (
            <button
              onClick={() => navigate("/projects")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-primary, #38bdf8)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>View all projects ({projects.length})</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {latestProject ? (
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "var(--radius-xl)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 260, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                  }}
                >
                  {latestProject.contentType}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  • {latestProject.progressPercent || 25}% complete • Status: {latestProject.status}
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                "{latestProject.title}"
              </h3>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11.5, color: latestProject.research ? "#34d399" : "var(--text-dim)" }}>
                  Research {latestProject.research ? "✓" : "○"}
                </span>
                <span style={{ fontSize: 11.5, color: latestProject.packaging ? "#34d399" : "var(--text-dim)" }}>
                  Packaging {latestProject.packaging ? "✓" : "○"}
                </span>
                <span style={{ fontSize: 11.5, color: latestProject.longFormScript ? "#34d399" : "var(--text-dim)" }}>
                  Script {latestProject.longFormScript ? "✓" : "○"}
                </span>
                <span style={{ fontSize: 11.5, color: (latestProject.shorts?.length || 0) > 0 ? "#34d399" : "var(--text-dim)" }}>
                  Shorts {(latestProject.shorts?.length || 0) > 0 ? "✓" : "○"}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleContinueProject(latestProject)}
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                fontSize: 13.5,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
              }}
            >
              <Play size={15} />
              Continue Blueprint
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px dashed var(--border-subtle, rgba(255,255,255,0.15))",
              borderRadius: "var(--radius-lg)",
              padding: "28px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>
              Your next video starts here.
            </p>
            <button
              onClick={() => handleQuickCreate("Short")}
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
              }}
            >
              <Plus size={15} />
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: Content Pipeline Stages */}
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FolderGit2 size={16} color="var(--accent-primary, #38bdf8)" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
              Content Pipeline
            </span>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            {projects.length} Total Projects
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { stage: "Draft", count: pipelineCounts.Draft, color: "#94a3b8" },
            { stage: "Researching", count: pipelineCounts.Researching, color: "#38bdf8" },
            { stage: "Writing", count: pipelineCounts.Writing, color: "#f59e0b" },
            { stage: "Packaged", count: pipelineCounts.Packaged, color: "#a855f7" },
            { stage: "Ready to Record", count: pipelineCounts["Ready to Record"], color: "#34d399" },
            { stage: "Published", count: pipelineCounts.Published, color: "#10b981" },
          ].map((item) => (
            <div
              key={item.stage}
              onClick={() => navigate("/projects")}
              style={{
                background: "var(--bg-surface-2, #1f2937)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>{item.stage}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color, marginTop: 2 }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Saved Ideas / Quick Action */}
      {savedIdeas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bookmark size={16} color="#f59e0b" />
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Saved Ideas ({savedIdeas.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {savedIdeas.slice(0, 4).map((idea) => (
              <div
                key={idea.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35 }}>
                  {idea.title}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button
                    onClick={() => handleQuickCreate("Short", idea.title)}
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      fontSize: 11.5,
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
                    onClick={() => handleQuickCreate("Thumbnail", idea.title)}
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: 4,
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#f59e0b",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    + Thumbnail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}