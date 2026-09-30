import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderGit2,
  Plus,
  Search,
  Clapperboard,
  Layers,
  FileText,
  MoreVertical,
  Copy,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../lib/store";
import type { Project, ProjectType } from "../types";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { state, user, createProject, duplicateProject, deleteProject, setCurrentProject } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ProjectType>("Short");
  const [newLanguage, setNewLanguage] = useState<"English" | "Hindi" | "Hinglish">("English");
  const [newTone, setNewTone] = useState(user?.tone || "Direct & Punchy");

  const projects = useMemo(() => state.projects || [], [state.projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "ALL" || p.contentType === selectedType;
      const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [projects, searchQuery, selectedType, selectedStatus]);

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project.id);
    if (project.contentType === "Short") {
      navigate("/shorts", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else if (project.contentType === "Thumbnail") {
      navigate("/packaging", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    } else {
      navigate("/script", { state: { projectId: project.id, topic: project.topic, title: project.title } });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createProject({
      title: newTitle.trim(),
      topic: newTitle.trim(),
      contentType: newType,
      language: newLanguage,
      tone: newTone,
      targetAudience: user?.target_audience || "YouTube Viewers",
    });

    setCreateModalOpen(false);
    setNewTitle("");
    handleOpenProject(created);
  };

  const handleExportPack = (project: Project) => {
    const markdownPack = `# ${project.title} — Production Pack
Content Type: ${project.contentType}
Status: ${project.status}
Target Audience: ${project.targetAudience || "General"}
Language: ${project.language || "English"}

---

## 1. Title Strategy
${project.packaging?.recommendedTitle ? `Recommended: ${project.packaging.recommendedTitle}` : `Title: ${project.title}`}
${project.packaging?.whyRecommended ? `Rationale: ${project.packaging.whyRecommended}` : ""}

---

## 2. Thumbnail Visual Blueprint
${project.packaging?.visualBlueprint ? `
- Subject: ${project.packaging.visualBlueprint.subject}
- Visual Medium: ${project.packaging.visualBlueprint.visualMedium}
- Lighting: ${project.packaging.visualBlueprint.lightingScheme}
- Composition: ${project.packaging.visualBlueprint.composition}
- Engine Prompt: ${project.packaging.visualBlueprint.enginePrompt}
` : "No thumbnail generated yet."}

---

## 3. Script & Production Blueprint
${project.longFormScript?.hook ? `
### Hook
${project.longFormScript.hook}

### Script Sections
${project.longFormScript.sections.map((s) => `#### ${s.heading}\n${s.spokenVoiceover}`).join("\n\n")}
` : project.shorts?.[0]?.script?.fullVoiceover ? `
### Spoken Voiceover
${project.shorts[0].script.fullVoiceover}

### Scene-by-Scene Timeline
${project.shorts[0].timeline.map((sc) => `Scene ${sc.sceneNumber} (${sc.timeRange}): [${sc.productionMethod}] ${sc.voiceover}`).join("\n")}
` : "No script generated yet."}
`;

    const blob = new Blob([markdownPack], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_production_pack.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case "Short":
        return <Clapperboard size={15} color="#38bdf8" />;
      case "Thumbnail":
        return <Layers size={15} color="#f59e0b" />;
      case "Full Video":
        return <FileText size={15} color="#a855f7" />;
    }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FolderGit2 size={20} color="var(--accent-primary, #38bdf8)" />
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Creator Projects
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)" }}>
            Unified workspace blueprints for your videos, shorts, and thumbnails.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 14px rgba(56, 189, 248, 0.25)",
          }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          background: "var(--surface-2)",
          padding: "12px 16px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
          />
          <input
            type="text"
            placeholder="Search projects by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              background: "var(--bg-surface-2, #1f2937)",
              border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: 13,
            }}
          />
        </div>

        {/* Content Type Filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["ALL", "Short", "Thumbnail", "Full Video"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: selectedType === type ? "var(--accent-primary, #38bdf8)" : "var(--bg-surface-2, #1f2937)",
                color: selectedType === type ? "#000" : "var(--text-secondary)",
                border: "1px solid " + (selectedType === type ? "transparent" : "var(--border-subtle, rgba(255,255,255,0.08))"),
                transition: "all 0.15s ease",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "6px 12px",
            background: "var(--bg-surface-2, #1f2937)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Researching">Researching</option>
          <option value="Writing">Writing</option>
          <option value="Packaged">Packaged</option>
          <option value="Ready to Record">Ready to Record</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px dashed var(--border-subtle, rgba(255,255,255,0.15))",
            borderRadius: "var(--radius-xl)",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary, #38bdf8)",
            }}
          >
            <FolderGit2 size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
              {searchQuery || selectedType !== "ALL" || selectedStatus !== "ALL"
                ? "No matching projects found"
                : "Your next video starts here."}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, maxWidth: 420 }}>
              {searchQuery || selectedType !== "ALL" || selectedStatus !== "ALL"
                ? "Try clearing filters or search for another keyword."
                : "Create a Short, Thumbnail, or Full Video project to generate synchronized blueprints before you record."}
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
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
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                borderRadius: "var(--radius-lg)",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                position: "relative",
                transition: "transform 0.15s ease, border-color 0.15s ease",
              }}
            >
              {/* Card Header: Type Badge, Status, Action Menu */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {getTypeIcon(project.contentType)}
                    {project.contentType}
                  </span>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        project.status === "Ready to Record"
                          ? "rgba(16, 185, 129, 0.15)"
                          : project.status === "Packaged"
                          ? "rgba(56, 189, 248, 0.15)"
                          : "rgba(245, 158, 11, 0.15)",
                      color:
                        project.status === "Ready to Record"
                          ? "#34d399"
                          : project.status === "Packaged"
                          ? "#38bdf8"
                          : "#fbbf24",
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setActionMenuOpenId(actionMenuOpenId === project.id ? null : project.id)}
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                  >
                    <MoreVertical size={15} />
                  </button>

                  {actionMenuOpenId === project.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 32,
                        background: "var(--bg-surface-2, #1f2937)",
                        border: "1px solid var(--border-subtle, rgba(255,255,255,0.12))",
                        borderRadius: "var(--radius-md)",
                        padding: 4,
                        zIndex: 20,
                        minWidth: 160,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      }}
                    >
                      <button
                        onClick={() => {
                          setActionMenuOpenId(null);
                          handleOpenProject(project);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "none",
                          border: "none",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 4,
                        }}
                      >
                        <ExternalLink size={13} />
                        Open Workspace
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuOpenId(null);
                          duplicateProject(project.id);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "none",
                          border: "none",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 4,
                        }}
                      >
                        <Copy size={13} />
                        Duplicate Project
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuOpenId(null);
                          handleExportPack(project);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "none",
                          border: "none",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 4,
                        }}
                      >
                        <Download size={13} />
                        Export Production Pack
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuOpenId(null);
                          if (confirm(`Delete project "${project.title}"?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "none",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 4,
                        }}
                      >
                        <Trash2 size={13} />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Preview */}
              <div>
                <h3
                  onClick={() => handleOpenProject(project)}
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    margin: "0 0 6px 0",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    lineHeight: 1.35,
                  }}
                >
                  {project.title}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Topic: {project.topic}
                </p>
              </div>

              {/* Stage Checklist / Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>
                  <span>Blueprint Progress</span>
                  <span>{project.progressPercent || 20}%</span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${project.progressPercent || 20}%`,
                      background: "linear-gradient(90deg, #38bdf8, #34d399)",
                      borderRadius: 2,
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, color: project.research ? "#34d399" : "var(--text-dim)" }}>
                    Research {project.research ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 10.5, color: project.packaging ? "#34d399" : "var(--text-dim)" }}>
                    Packaging {project.packaging ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 10.5, color: project.longFormScript ? "#34d399" : "var(--text-dim)" }}>
                    Script {project.longFormScript ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 10.5, color: (project.shorts?.length || 0) > 0 ? "#34d399" : "var(--text-dim)" }}>
                    Shorts {(project.shorts?.length || 0) > 0 ? "✓" : "○"}
                  </span>
                </div>
              </div>

              {/* Footer Button */}
              <button
                onClick={() => handleOpenProject(project)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-surface-2, #1f2937)",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                  borderRadius: "var(--radius-md)",
                  color: "var(--accent-primary, #38bdf8)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>Continue Blueprint</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {createModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle, rgba(255,255,255,0.15))",
              borderRadius: "var(--radius-xl)",
              padding: 24,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={20} color="var(--accent-primary, #38bdf8)" />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Create New Video Project
              </h2>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  What are you creating? (Topic or Working Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why BCA Students Struggle With Internships"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-surface-2, #1f2937)",
                    border: "1px solid var(--border-subtle, rgba(255,255,255,0.15))",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Format Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {(["Short", "Thumbnail", "Full Video"] as ProjectType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setNewType(type)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "var(--radius-md)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        background: newType === type ? "rgba(56, 189, 248, 0.15)" : "var(--bg-surface-2, #1f2937)",
                        border: "1px solid " + (newType === type ? "var(--accent-primary, #38bdf8)" : "var(--border-subtle, rgba(255,255,255,0.08))"),
                        color: newType === type ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                      }}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Language
                  </label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-surface-2, #1f2937)",
                      border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12.5,
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Tone & Style
                  </label>
                  <input
                    type="text"
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value)}
                    placeholder="Direct & Punchy"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "var(--bg-surface-2, #1f2937)",
                      border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12.5,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    background: "none",
                    border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
