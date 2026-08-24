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
  Play,
} from "lucide-react";
import { useStore } from "../lib/store";
import { greeting } from "../lib/format";
import type { Project, ProjectType, ProjectStatus } from "../types";
import {
  Button,
  Card,
  MetricCard,
  EmptyState,
  Badge,
} from "../components/ui";

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

  const projects   = useMemo(() => state.projects   || [], [state.projects]);
  const savedIdeas = useMemo(() => state.savedIdeas || [], [state.savedIdeas]);
  const latestProject = useMemo(() => projects[0] || null, [projects]);

  const handleQuickCreate = (type: ProjectType, customTopic?: string) => {
    const raw = (customTopic || topicInput).trim();
    const defaultTitle =
      raw ||
      (type === "Short"
        ? "New Short Video"
        : type === "Thumbnail"
          ? "New Thumbnail Blueprint"
          : "New Full Video Script");

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

  const pipelineStages: { stage: ProjectStatus; trend: "up" | "down" | "neutral" }[] = [
    { stage: "Draft",            trend: "neutral" },
    { stage: "Researching",      trend: "up"      },
    { stage: "Writing",          trend: "up"      },
    { stage: "Packaged",         trend: "up"      },
    { stage: "Ready to Record",  trend: "up"      },
    { stage: "Published",        trend: "neutral" },
  ];

  return (
    <div className="page-enter flex flex-col gap-token-8 max-w-[1200px] mx-auto">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start flex-wrap gap-token-4">
        <div>
          <div className="text-token-xs font-bold text-token-accent-blue uppercase tracking-widest mb-token-1">
            CREATOR PRE-PRODUCTION WORKSPACE
          </div>
          <h1 className="text-token-2xl font-bold text-token-text m-0">
            {greeting(user?.name || "Creator")}.
          </h1>
          <p className="text-token-text-secondary mt-token-1 text-token-base">
            Turn your raw ideas into audience-aware, production-ready video blueprints before you record.
          </p>
        </div>

        {/* Creator Memory badge */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-token-3 bg-token-surface-2 border border-token-border rounded-token-lg px-token-4 py-token-2 cursor-pointer transition-all duration-150 hover:border-token-border-light"
        >
          <span
            className="w-2 h-2 rounded-token-full shrink-0"
            style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }}
          />
          <div className="flex flex-col text-left">
            <span className="text-token-xs font-semibold text-token-text-muted">
              Master Creator Memory
            </span>
            <span className="text-token-sm font-bold text-token-text">
              {user?.niche ? user.niche.slice(0, 24) : "Tech & Education"} •{" "}
              {user?.target_audience ? "Audience Aware" : "Default"}
            </span>
          </div>
          <span className="text-token-xs font-semibold text-token-accent-blue ml-token-1">
            Edit
          </span>
        </button>
      </div>

      {/* ── Section 1: Quick Create ───────────────────────────────── */}
      <div className="flex flex-col gap-token-4">
        <div className="flex items-center gap-token-2">
          <Sparkles size={18} color="var(--accent-blue)" />
          <h2 className="text-token-xl font-bold text-token-text m-0">
            What are you creating?
          </h2>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-token-4">
          {/* Short */}
          <Card
            interactive
            onClick={() => handleQuickCreate("Short")}
            className="flex flex-col gap-token-3 border-[rgba(56,189,248,0.2)] hover:border-[rgba(56,189,248,0.5)]"
          >
            <div className="flex justify-between items-center">
              <div
                className="w-10 h-10 rounded-token-sm flex items-center justify-center"
                style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8" }}
              >
                <Clapperboard size={20} />
              </div>
              <Badge variant="accent">VERTICAL 9:16</Badge>
            </div>
            <div>
              <h3 className="text-token-lg font-bold text-token-text mb-token-1">Create a Short</h3>
              <p className="text-token-sm text-token-text-secondary leading-relaxed">
                Hooks, word-budgeted voiceover, scene-by-scene editing timeline, and production prompts.
              </p>
            </div>
            <div className="flex items-center gap-token-1 text-token-sm font-semibold mt-auto" style={{ color: "#38bdf8" }}>
              <span>Launch Shorts Studio</span>
              <ArrowRight size={14} />
            </div>
          </Card>

          {/* Thumbnail */}
          <Card
            interactive
            onClick={() => handleQuickCreate("Thumbnail")}
            className="flex flex-col gap-token-3 border-[rgba(245,158,11,0.2)] hover:border-[rgba(245,158,11,0.5)]"
          >
            <div className="flex justify-between items-center">
              <div
                className="w-10 h-10 rounded-token-sm flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
              >
                <Layers size={20} />
              </div>
              <Badge variant="warning">16:9 PACKAGING</Badge>
            </div>
            <div>
              <h3 className="text-token-lg font-bold text-token-text mb-token-1">Create a Thumbnail</h3>
              <p className="text-token-sm text-token-text-secondary leading-relaxed">
                10-framework psychological titles paired with high-CTR synchronized visual concepts and typography.
              </p>
            </div>
            <div className="flex items-center gap-token-1 text-token-sm font-semibold mt-auto" style={{ color: "#f59e0b" }}>
              <span>Launch Thumbnail Studio</span>
              <ArrowRight size={14} />
            </div>
          </Card>

          {/* Full Video */}
          <Card
            interactive
            onClick={() => handleQuickCreate("Full Video")}
            className="flex flex-col gap-token-3 border-[rgba(168,85,247,0.2)] hover:border-[rgba(168,85,247,0.5)]"
          >
            <div className="flex justify-between items-center">
              <div
                className="w-10 h-10 rounded-token-sm flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
              >
                <FileText size={20} />
              </div>
              <Badge variant="accent" className="border-[var(--accent-purple)] text-[var(--accent-purple)] bg-[var(--accent-purple-dim)]">
                LONG-FORM
              </Badge>
            </div>
            <div>
              <h3 className="text-token-lg font-bold text-token-text mb-token-1">Create Full Video</h3>
              <p className="text-token-sm text-token-text-secondary leading-relaxed">
                Retention-optimized script outline, spoken voiceover, visual cues, and chapter structure.
              </p>
            </div>
            <div className="flex items-center gap-token-1 text-token-sm font-semibold mt-auto" style={{ color: "#a855f7" }}>
              <span>Launch Long-Form Studio</span>
              <ArrowRight size={14} />
            </div>
          </Card>
        </div>

        {/* Quick topic input */}
        <Card noPad className="p-token-4 flex flex-col gap-token-3">
          <div className="flex gap-token-3 items-center flex-wrap">
            <input
              type="text"
              placeholder='Type an idea or topic (e.g. "Java DSA Roadmap in 2026")...'
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && topicInput.trim()) handleQuickCreate("Short", topicInput);
              }}
              className={[
                "flex-1 min-w-[240px] px-token-3 py-token-2 text-token-base",
                "bg-token-surface border border-token-border rounded-token-md text-token-text",
                "placeholder:text-token-text-muted outline-none",
                "transition-all duration-150 focus:border-token-accent focus:ring-2 focus:ring-[var(--accent-glow)]",
              ].join(" ")}
            />
            <div className="flex gap-token-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleQuickCreate("Short")}
                disabled={!topicInput.trim()}
              >
                + Short
              </Button>
              <button
                onClick={() => handleQuickCreate("Thumbnail")}
                disabled={!topicInput.trim()}
                className="h-7 px-token-3 text-token-sm font-semibold rounded-token-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                + Thumbnail
              </button>
              <button
                onClick={() => handleQuickCreate("Full Video")}
                disabled={!topicInput.trim()}
                className="h-7 px-token-3 text-token-sm font-semibold rounded-token-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
              >
                + Script
              </button>
            </div>
          </div>

          {/* Quick example chips */}
          <div className="flex items-center gap-token-2 flex-wrap">
            <span className="text-token-xs font-semibold text-token-text-muted">Quick topics:</span>
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setTopicInput(ex); handleQuickCreate("Short", ex); }}
                className="px-token-2 py-[3px] text-token-xs text-token-text-secondary border border-token-border rounded-token-full bg-transparent hover:bg-token-surface-2 transition-all duration-150"
              >
                {ex}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Section 2: Continue Where You Left Off ───────────────── */}
      <div className="flex flex-col gap-token-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-token-2">
            <Clock size={17} color="var(--accent-blue)" />
            <h2 className="text-token-xl font-bold text-token-text m-0">
              Continue where you left off
            </h2>
          </div>
          {projects.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
              View all projects ({projects.length})
              <ArrowRight size={13} />
            </Button>
          )}
        </div>

        {latestProject ? (
          <Card className="flex justify-between items-center flex-wrap gap-token-4 border-[rgba(56,189,248,0.25)]">
            <div className="flex flex-col gap-token-2 min-w-[220px] flex-1">
              <div className="flex items-center gap-token-2">
                <Badge variant="accent">{latestProject.contentType}</Badge>
                <span className="text-token-xs text-token-text-muted">
                  • {latestProject.progressPercent || 25}% complete • {latestProject.status}
                </span>
              </div>
              <h3 className="text-token-xl font-bold text-token-text m-0">
                "{latestProject.title}"
              </h3>
              <div className="flex gap-token-2 mt-token-1">
                {[
                  { label: "Research",   done: !!latestProject.research },
                  { label: "Packaging",  done: !!latestProject.packaging },
                  { label: "Script",     done: !!latestProject.longFormScript },
                  { label: "Shorts",     done: (latestProject.shorts?.length || 0) > 0 },
                ].map(({ label, done }) => (
                  <span
                    key={label}
                    className="text-token-xs font-medium"
                    style={{ color: done ? "#34d399" : "var(--text-dim)" }}
                  >
                    {label} {done ? "✓" : "○"}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleContinueProject(latestProject)}
            >
              <Play size={14} />
              Continue Blueprint
            </Button>
          </Card>
        ) : (
          <EmptyState
            icon={<FolderGit2 size={32} />}
            heading="Your next video starts here."
            description="Create a project to begin tracking your production pipeline."
            ctaLabel="Create your first project"
            onCta={() => handleQuickCreate("Short")}
          />
        )}
      </div>

      {/* ── Section 3: Content Pipeline ──────────────────────────── */}
      <Card noPad className="flex flex-col gap-token-3 p-token-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-token-2">
            <FolderGit2 size={16} color="var(--accent-blue)" />
            <span className="text-token-sm font-bold text-token-text">Content Pipeline</span>
          </div>
          <span className="text-token-xs text-token-text-muted">{projects.length} Total Projects</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-token-2">
          {pipelineStages.map(({ stage, trend }) => (
            <MetricCard
              key={stage}
              label={stage}
              value={pipelineCounts[stage]}
              trend={pipelineCounts[stage] > 0 ? trend : "neutral"}
              onClick={() => navigate("/projects")}
            />
          ))}
        </div>
      </Card>

      {/* ── Section 4: Saved Ideas ────────────────────────────────── */}
      {savedIdeas.length > 0 && (
        <div className="flex flex-col gap-token-3">
          <div className="flex items-center gap-token-2">
            <Bookmark size={16} color="var(--accent-amber)" />
            <h2 className="text-token-lg font-bold text-token-text m-0">
              Saved Ideas ({savedIdeas.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-token-3">
            {savedIdeas.slice(0, 4).map((idea) => (
              <Card key={idea.id} className="flex flex-col gap-token-3">
                <div className="text-token-sm font-bold text-token-text leading-snug flex-1">
                  {idea.title}
                </div>
                <div className="flex gap-token-2 mt-auto">
                  <button
                    onClick={() => handleQuickCreate("Short", idea.title)}
                    className="flex-1 py-[5px] text-token-xs font-semibold rounded-token-sm transition-all duration-150 hover:opacity-80"
                    style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "none" }}
                  >
                    + Short
                  </button>
                  <button
                    onClick={() => handleQuickCreate("Thumbnail", idea.title)}
                    className="flex-1 py-[5px] text-token-xs font-semibold rounded-token-sm transition-all duration-150 hover:opacity-80"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "none" }}
                  >
                    + Thumbnail
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}