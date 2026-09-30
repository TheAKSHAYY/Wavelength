import { useNavigate } from "react-router-dom";
import {
  Compass,
  Layers,
  FileText,
  Clapperboard,
  CheckCircle2,
  ArrowRight,
  FolderGit2,
} from "lucide-react";
import { useStore } from "../lib/store";
import type { Project } from "../types";

export type WorkflowPhase = "research" | "packaging" | "script" | "export";

interface ProjectWorkflowBarProps {
  currentPhase: WorkflowPhase;
  projectOverride?: Project | null;
  onNextPhase?: () => void;
  nextPhaseLabel?: string;
}

export default function ProjectWorkflowBar({
  currentPhase,
  projectOverride,
  onNextPhase,
  nextPhaseLabel,
}: ProjectWorkflowBarProps) {
  const navigate = useNavigate();
  const { activeProject: storeProject } = useStore();
  const project = projectOverride || storeProject;

  if (!project) return null;

  const isShort = project.contentType === "Short";

  const phases = [
    {
      id: "research" as WorkflowPhase,
      label: "1. Concept & Angles",
      icon: Compass,
      done: Boolean(project.research),
      path: "/research",
    },
    {
      id: "packaging" as WorkflowPhase,
      label: "2. Title & Thumbnail",
      icon: Layers,
      done: Boolean(project.packaging?.recommendedTitle || project.packaging?.visualBlueprint),
      path: "/packaging",
    },
    {
      id: "script" as WorkflowPhase,
      label: isShort ? "3. Short Script (9:16)" : "3. Video Script (16:9)",
      icon: isShort ? Clapperboard : FileText,
      done: Boolean((project.shorts?.length || 0) > 0 || project.longFormScript),
      path: isShort ? "/shorts" : "/script",
    },
    {
      id: "export" as WorkflowPhase,
      label: "4. Film & Export",
      icon: CheckCircle2,
      done: project.status === "Ready to Record" || project.status === "Published",
      path: "/projects",
    },
  ];

  const handleNavigateStep = (stepPath: string) => {
    navigate(stepPath, {
      state: {
        projectId: project.id,
        topic: project.topic,
        title: project.title,
      },
    });
  };

  return (
    <div className="workflow-bar">
      {/* Left: Active Project Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button
          onClick={() => navigate("/projects")}
          className="icon-btn"
          style={{ width: 34, height: 34 }}
          title="All Projects"
        >
          <FolderGit2 size={16} />
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                padding: "2px 8px",
                borderRadius: 4,
                background: isShort ? "rgba(99, 102, 241, 0.15)" : "rgba(14, 165, 233, 0.15)",
                color: isShort ? "var(--accent)" : "var(--accent-blue)",
                border: `1px solid ${isShort ? "rgba(99, 102, 241, 0.3)" : "rgba(14, 165, 233, 0.3)"}`,
              }}
            >
              {isShort ? "9:16 SHORT" : "16:9 VIDEO"}
            </span>

            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              Status: <strong style={{ color: "var(--text-primary)" }}>{project.status}</strong>
            </span>
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "clamp(200px, 30vw, 420px)",
              marginTop: 2,
            }}
            title={project.title}
          >
            "{project.title}"
          </div>
        </div>
      </div>

      {/* Middle: Interactive Phase Stepper */}
      <div className="workflow-stepper">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const isActive = phase.id === currentPhase;
          const isDone = phase.done;

          return (
            <div key={phase.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => handleNavigateStep(phase.path)}
                className={`workflow-step-pill ${isActive ? "active" : isDone ? "done" : ""}`}
              >
                <Icon size={14} />
                <span>{phase.label}</span>
                {isDone && !isActive && <CheckCircle2 size={12} color="var(--accent-mint)" />}
              </button>

              {idx < phases.length - 1 && <span className="workflow-divider">→</span>}
            </div>
          );
        })}
      </div>

      {/* Right: Quick Next Phase Action */}
      {onNextPhase && (
        <button
          onClick={onNextPhase}
          className="btn btn-primary"
          style={{
            padding: "6px 14px",
            fontSize: 12.5,
            fontWeight: 700,
            gap: 6,
            marginLeft: "auto",
          }}
        >
          <span>{nextPhaseLabel || "Next Step"}</span>
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
