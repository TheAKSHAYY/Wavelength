import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Clapperboard,
  Layers,
  FileText,
  FolderGit2,
  Bookmark,
  Play,
  CheckCircle2,
  Plus,
  Compass,
} from "lucide-react";
import { useStore } from "../lib/store";
import { greeting } from "../lib/format";
import type { Project, ProjectType, ProjectStatus } from "../types";

const POPULAR_IDEAS = [
  { topic: "Why Senior Developers Write Less Code", tag: "Career", type: "Short" as ProjectType },
  { topic: "How I Built a Real-Time App with Zero Servers", tag: "Tech", type: "Full Video" as ProjectType },
  { topic: "The Lie You Were Told About React Performance", tag: "Dev", type: "Short" as ProjectType },
  { topic: "Mastering System Design in 15 Minutes", tag: "Architecture", type: "Full Video" as ProjectType },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, state, createProject, setCurrentProject } = useStore();
  const [quickTopic, setQuickTopic] = useState("");

  const projects = useMemo(() => state.projects || [], [state.projects]);
  const savedIdeas = useMemo(() => state.savedIdeas || [], [state.savedIdeas]);
  const latestProject = useMemo(() => projects[0] || null, [projects]);

  const handleStartVideo = (type: ProjectType, topicParam?: string) => {
    const raw = (topicParam || quickTopic).trim();
    const defaultTitle =
      raw ||
      (type === "Short"
        ? "New Vertical Short"
        : type === "Thumbnail"
          ? "New Thumbnail Concept"
          : "New Full Video");

    const created = createProject({
      title: defaultTitle,
      topic: raw || defaultTitle,
      contentType: type,
      language: "English",
      tone: user?.tone || "Direct & Punchy",
      targetAudience: user?.target_audience || "YouTube Viewers",
    });

    setCurrentProject(created.id);
    setQuickTopic("");

    if (type === "Short") {
      navigate("/shorts", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    } else if (type === "Thumbnail") {
      navigate("/packaging", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    } else {
      navigate("/packaging", { state: { projectId: created.id, topic: created.topic, title: created.title } });
    }
  };

  const handleContinueProject = (project: Project) => {
    setCurrentProject(project.id);
    if (project.contentType === "Short") {
      navigate("/shorts", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else if (project.contentType === "Thumbnail") {
      navigate("/packaging", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else {
      if (project.packaging?.recommendedTitle || project.packaging?.visualBlueprint) {
        navigate("/script", { state: { projectId: project.id, topic: project.topic, title: project.title } });
      } else {
        navigate("/packaging", { state: { projectId: project.id, topic: project.topic, title: project.title } });
      }
    }
  };

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
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return counts;
  }, [projects]);

  const pipelineStages: { stage: ProjectStatus; label: string; color: string }[] = [
    { stage: "Draft", label: "Draft", color: "var(--text-tertiary)" },
    { stage: "Researching", label: "Research", color: "var(--accent-blue)" },
    { stage: "Packaged", label: "Packaged", color: "var(--accent-amber)" },
    { stage: "Writing", label: "Scripting", color: "var(--accent-purple)" },
    { stage: "Ready to Record", label: "Ready to Film", color: "var(--accent-mint)" },
    { stage: "Published", label: "Published", color: "var(--accent)" },
  ];

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8, 32px)",
        maxWidth: 1200,
        margin: "0 auto",
        paddingBottom: "var(--space-12, 48px)",
      }}
    >
      {/* ── 1. Page Header ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-4, 16px)",
          paddingBottom: "var(--space-4, 16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3, 12px)", marginBottom: "var(--space-1, 4px)" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl, 31px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              {greeting(user?.name || "Creator")}
            </h1>
            {user?.niche && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs, 12px)",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  background: "var(--surface-2)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {user.niche}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm, 14px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: "65ch",
              margin: 0,
            }}
          >
            Welcome back to your studio. Plan, package, and script your next high-retention video.
          </p>
        </div>

        {/* Secondary Header Actions (Does not compete with the single coral Hero CTA) */}
        <div style={{ display: "flex", gap: "var(--space-2, 8px)" }}>
          <button
            onClick={() => navigate("/research")}
            className="btn btn-secondary"
            style={{ fontSize: "var(--text-sm, 14px)", gap: 6 }}
          >
            <Compass size={15} /> Topic Research
          </button>
          <button
            onClick={() => handleStartVideo("Short")}
            className="btn btn-secondary"
            style={{ fontSize: "var(--text-sm, 14px)", gap: 6 }}
          >
            <Plus size={15} /> New Video
          </button>
        </div>
      </div>

      {/* ── 2. Primary Focal Element: Active Video Hero Card ───────── */}
      {latestProject ? (
        <div
          className="studio-hero-card"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md, 12px)",
            padding: "var(--space-6, 24px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4, 16px)" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3, 12px)", marginBottom: "var(--space-2, 8px)" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs, 12px)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: "rgba(255, 107, 74, 0.12)",
                    color: "var(--accent)",
                    border: "1px solid rgba(255, 107, 74, 0.25)",
                  }}
                >
                  {latestProject.contentType === "Short" ? "9:16 Short" : "16:9 Full Video"}
                </span>

                <span style={{ fontSize: "var(--text-xs, 12px)", color: "var(--text-secondary)" }}>
                  Status: <strong style={{ color: "var(--text-primary)" }}>{latestProject.status}</strong>
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg, 25px)",
                  fontWeight: 700,
                  margin: "0 0 12px 0",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                "{latestProject.title}"
              </h2>

              {/* Progress Milestones */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4, 16px)", flexWrap: "wrap" }}>
                {[
                  { label: "Concept", done: Boolean(latestProject.research) },
                  {
                    label: "Packaging",
                    done: Boolean(
                      latestProject.packaging?.recommendedTitle ||
                        latestProject.packaging?.visualBlueprint
                    ),
                  },
                  {
                    label: "Script",
                    done: Boolean(
                      (latestProject.shorts?.length || 0) > 0 ||
                        latestProject.longFormScript
                    ),
                  },
                  {
                    label: "Ready to Film",
                    done: latestProject.status === "Ready to Record",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "var(--text-xs, 12px)",
                      fontWeight: 500,
                      color: item.done ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color={item.done ? "var(--accent-mint)" : "var(--text-tertiary)"}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exactly ONE Primary Focal Coral Button */}
            <button
              onClick={() => handleContinueProject(latestProject)}
              className="btn btn-primary"
              style={{
                padding: "10px 22px",
                fontSize: "var(--text-sm, 14px)",
                fontWeight: 600,
                gap: 8,
                borderRadius: "var(--radius-sm)",
                alignSelf: "flex-start",
              }}
            >
              <Play size={14} fill="currentColor" /> Continue Working →
            </button>
          </div>
        </div>
      ) : (
        /* Empty project starter: Contains the single coral primary CTA */
        <div
          className="studio-hero-card"
          style={{
            background: "var(--surface-1)",
            textAlign: "center",
            padding: "var(--space-8, 32px) var(--space-6, 24px)",
            alignItems: "center",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md, 12px)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-sm)",
              background: "rgba(255, 107, 74, 0.12)",
              color: "var(--accent)",
              border: "1px solid rgba(255, 107, 74, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg, 25px)", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Start Your First Video Blueprint
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm, 14px)", color: "var(--text-secondary)", maxWidth: "55ch", margin: "0 auto", lineHeight: 1.6 }}>
              Wavelength orchestrates your entire video workflow from raw concept to high-CTR title, thumbnail art direction, and spoken script.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3, 12px)", marginTop: "var(--space-2, 8px)" }}>
            <button
              onClick={() => handleStartVideo("Short")}
              className="btn btn-primary"
              style={{ gap: 6, fontSize: "var(--text-sm, 14px)", fontWeight: 600 }}
            >
              <Clapperboard size={15} /> + New Short (9:16)
            </button>
            <button
              onClick={() => handleStartVideo("Full Video")}
              className="btn btn-secondary"
              style={{ gap: 6, fontSize: "var(--text-sm, 14px)", fontWeight: 600 }}
            >
              <FileText size={15} /> + New Full Video (16:9)
            </button>
          </div>
        </div>
      )}

      {/* ── 3. Start a Video: Format Studio Cards ───────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4, 16px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Creation Studios
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs, 12px)", color: "var(--text-secondary)", margin: 0, marginTop: 2 }}>
              Choose your format to launch a specialized studio workflow
            </p>
          </div>
        </div>

        <div className="studio-grid">
          {/* Card 1: 9:16 Shorts Studio */}
          <div
            onClick={() => handleStartVideo("Short")}
            className="studio-card hover-lift"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clapperboard size={18} />
              </div>
              <span
                style={{
                  fontSize: "var(--text-xs, 12px)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                9:16 VERTICAL
              </span>
            </div>

            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: "0 0 6px 0", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Shorts Studio
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm, 14px)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                Craft high-retention vertical videos with 0–3s verbal hooks, spoken pacing, and scene-by-scene editing cues.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "var(--space-3, 12px)",
                borderTop: "1px solid var(--border)",
                marginTop: "auto",
                fontSize: "var(--text-sm, 14px)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              <span>Launch Shorts Studio</span>
              <ArrowRight size={14} color="var(--accent)" />
            </div>
          </div>

          {/* Card 2: 16:9 Thumbnail & Packaging */}
          <div
            onClick={() => handleStartVideo("Thumbnail")}
            className="studio-card hover-lift"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--accent-amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Layers size={18} />
              </div>
              <span
                style={{
                  fontSize: "var(--text-xs, 12px)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                PACKAGING & CTR
              </span>
            </div>

            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: "0 0 6px 0", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Thumbnail & Title Studio
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm, 14px)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                10 psychological title formulas paired with thumbnail art direction and live YouTube feed simulation.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "var(--space-3, 12px)",
                borderTop: "1px solid var(--border)",
                marginTop: "auto",
                fontSize: "var(--text-sm, 14px)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              <span>Launch Packaging Studio</span>
              <ArrowRight size={14} color="var(--accent-amber)" />
            </div>
          </div>

          {/* Card 3: Long-Form Script Studio */}
          <div
            onClick={() => handleStartVideo("Full Video")}
            className="studio-card hover-lift"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--accent-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={18} />
              </div>
              <span
                style={{
                  fontSize: "var(--text-xs, 12px)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                16:9 LONG-FORM
              </span>
            </div>

            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: "0 0 6px 0", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Full Video Script Studio
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm, 14px)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                Structure multi-act long-form videos with spoken voiceover pacing, visual B-roll cues, and teleprompter mode.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "var(--space-3, 12px)",
                borderTop: "1px solid var(--border)",
                marginTop: "auto",
                fontSize: "var(--text-sm, 14px)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              <span>Launch Script Studio</span>
              <ArrowRight size={14} color="var(--accent-blue)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Content Pipeline Tracker ────────────────────────────── */}
      <div
        style={{
          borderRadius: "var(--radius-md, 12px)",
          padding: "var(--space-5, 20px) var(--space-6, 24px)",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4, 16px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2, 8px)" }}>
            <FolderGit2 size={16} color="var(--accent)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Production Pipeline
            </h3>
          </div>

          <button
            onClick={() => navigate("/projects")}
            className="btn btn-ghost"
            style={{ fontSize: "var(--text-xs, 12px)", padding: "4px 8px" }}
          >
            View all ({projects.length}) →
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--space-2, 8px)",
          }}
        >
          {pipelineStages.map(({ stage, label, color }) => (
            <div
              key={stage}
              onClick={() => navigate("/projects")}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "border-color 150ms ease-out, transform 150ms ease-out",
              }}
              className="card-interactive"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className="label-caps">{label}</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-lg, 25px)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {pipelineCounts[stage]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Quick Ideas / Trending Inspirations ──────────────────── */}
      <div
        style={{
          borderRadius: "var(--radius-md, 12px)",
          padding: "var(--space-5, 20px) var(--space-6, 24px)",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4, 16px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2, 8px)" }}>
            <Sparkles size={16} color="var(--accent-amber)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              High-Potential Concepts
            </h3>
          </div>
          <span style={{ fontSize: "var(--text-xs, 12px)", color: "var(--text-secondary)" }}>
            Select any concept to launch production
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "var(--space-2, 8px)",
          }}
        >
          {POPULAR_IDEAS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleStartVideo(item.type, item.topic)}
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "border-color 150ms ease-out, transform 150ms ease-out",
              }}
              className="card-interactive"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    background: "var(--surface-3)",
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  {item.type === "Short" ? "SHORT (9:16)" : "VIDEO (16:9)"}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>#{item.tag}</span>
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm, 14px)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
                "{item.topic}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Saved Ideas Deck (if any) ───────────────────────────── */}
      {savedIdeas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3, 12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2, 8px)" }}>
            <Bookmark size={15} color="var(--accent-amber)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md, 20px)", fontWeight: 600, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Saved Ideas ({savedIdeas.length})
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "var(--space-2, 8px)",
            }}
          >
            {savedIdeas.slice(0, 4).map((idea) => (
              <div
                key={idea.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm, 14px)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
                  {idea.title}
                </div>

                <div style={{ display: "flex", gap: "var(--space-2, 8px)", marginTop: "auto" }}>
                  <button
                    onClick={() => handleStartVideo("Short", idea.title)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "5px 0", fontSize: "var(--text-xs, 12px)", justifyContent: "center" }}
                  >
                    + Short
                  </button>
                  <button
                    onClick={() => handleStartVideo("Full Video", idea.title)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "5px 0", fontSize: "var(--text-xs, 12px)", justifyContent: "center" }}
                  >
                    + Video
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