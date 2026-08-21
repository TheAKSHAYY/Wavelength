import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  Video,
  Camera,
  Music,
  Scissors,
  ListChecks,
  RefreshCw,
  FileText,
  Smartphone,
  Clock,
  Volume2,
  Monitor,
  Flame,
  Search,
  BookOpen,
  Layers,
  Wand2,
  Save,
  Download,
  FolderGit2,
  User,
} from "lucide-react";
import { useTask } from "../lib/hooks";
import { useStore } from "../lib/store";
import { ErrorBanner } from "../components/SharedUI";
import type { ShortsBlueprintOutput, ShortsCreatorMode, ShortsDuration, ShortsProductionMethod } from "../types";

const CREATOR_MODES: Array<{ mode: ShortsCreatorMode; label: string; desc: string }> = [
  { mode: "Educator", label: "Educator", desc: "Explains concepts naturally with clear real-world examples" },
  { mode: "Personal Creator", label: "Personal Creator", desc: "Conversational direct address, authentic first-person" },
  { mode: "Storyteller", label: "Storyteller", desc: "Curiosity progression, tension, and narrative stakes" },
  { mode: "Explainer", label: "Explainer", desc: "Concise, step-by-step breakdown of how something works" },
  { mode: "Commentary", label: "Commentary", desc: "Observation and opinion driven teardown" },
  { mode: "Experiment", label: "Experiment", desc: "Case study, live test results, and findings" },
  { mode: "Faceless Creator", label: "Faceless Creator", desc: "Optimized for screen recordings, B-roll, and graphics" },
  { mode: "Tutorial", label: "Tutorial", desc: "Actionable hands-on demonstration" },
];

const DURATIONS: Array<{ duration: ShortsDuration; label: string; words: string }> = [
  { duration: "15s", label: "15 Seconds", words: "~35-45 words (Ultra Fast)" },
  { duration: "30s", label: "30 Seconds", words: "~70-85 words (Standard Punchy)" },
  { duration: "45s", label: "45 Seconds", words: "~105-125 words (Story & Value)" },
  { duration: "60s", label: "60 Seconds", words: "~140-165 words (Full Deep Breakdown)" },
];

export default function ShortsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeProject, updateProject, createProject, setCurrentProject } = useStore();
  const state = (location.state || {}) as { topic?: string; title?: string; angle?: string; projectId?: string };

  const [topic, setTopic] = useState(state.topic || state.title || activeProject?.topic || activeProject?.title || "");
  const [creatorMode, setCreatorMode] = useState<ShortsCreatorMode>(activeProject?.creatorMode || "Educator");
  const [duration, setDuration] = useState<ShortsDuration>("45s");
  const [researchMode, setResearchMode] = useState(false);
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">(activeProject?.language || "English");

  const [blueprint, setBlueprint] = useState<ShortsBlueprintOutput | null>(() => {
    if (activeProject?.shorts && activeProject.shorts.length > 0) {
      return activeProject.shorts[0];
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<"timeline" | "script" | "visuals" | "editing" | "checklist" | "ai-prompt">("timeline");
  const [activeSceneFilter, setActiveSceneFilter] = useState<string>("ALL");
  const [selectedHookId, setSelectedHookId] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { loading, error, run, clearError } = useTask();

  const handleGenerate = async (targetTopic?: string) => {
    const q = (targetTopic || topic).trim();
    if (!q) return;

    clearError();
    await run(async () => {
      const res = await fetch("/api/generate/shorts-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: q,
          creatorMode,
          duration,
          language,
          researchMode,
          platform: "YouTube Shorts",
        }),
      });

      if (!res.ok) {
        throw new Error(`Shorts Studio failed to generate blueprint: ${res.statusText}`);
      }

      const data: ShortsBlueprintOutput = await res.json();
      setBlueprint(data);
      setSelectedHookId(data.hooks.selectedHookId || data.hooks.options[0]?.id || "hook_1");

      // Automatically update or create active project
      if (activeProject) {
        updateProject(activeProject.id, {
          topic: q,
          language,
          creatorMode,
          shorts: [data, ...(activeProject.shorts?.filter((s) => s.topic !== q) || [])],
          progressPercent: Math.max(activeProject.progressPercent || 0, 75),
          status: "Ready to Record",
        });
      }
    });
  };

  const handleSaveToProject = () => {
    if (!blueprint) return;
    if (activeProject) {
      updateProject(activeProject.id, {
        shorts: [blueprint, ...(activeProject.shorts?.filter((s) => s.topic !== blueprint.topic) || [])],
        progressPercent: Math.max(activeProject.progressPercent || 0, 80),
        status: "Ready to Record",
      });
    } else {
      const proj = createProject({
        title: blueprint.topic || topic,
        topic: blueprint.topic || topic,
        contentType: "Short",
        language,
        creatorMode,
        shorts: [blueprint],
        progressPercent: 80,
        status: "Ready to Record",
      });
      setCurrentProject(proj.id);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateThumbnail = () => {
    const hookText = blueprint?.hooks.selectedHookText || blueprint?.hooks.options[0]?.hookText || topic;
    navigate("/packaging", {
      state: {
        topic: blueprint?.topic || topic,
        title: blueprint?.topic || topic,
        hook: hookText,
        projectId: activeProject?.id,
      },
    });
  };

  const handleExportMarkdown = () => {
    if (!blueprint) return;
    const pack = `# ${blueprint.topic} — 9:16 Vertical Short Blueprint
Target Duration: ${blueprint.script.durationFormatted} (~${blueprint.script.wordCount} words)
Language: ${language}
Creator Mode: ${creatorMode}

---

## 1. Strategy & Content Angle
- Angle: ${blueprint.strategy.contentAngle}
- Why It Works: ${blueprint.strategy.whyThisAngleWorks}
- Pacing: ${blueprint.strategy.pacing}

---

## 2. Spoken Voiceover
${blueprint.script.fullVoiceover}

---

## 3. Scene-by-Scene Timeline
${blueprint.timeline.map((sc) => `
### Scene ${sc.sceneNumber} (${sc.timeRange}) [${sc.productionMethod}]
- Spoken Voiceover: "${sc.voiceover}"
- Visual Framing: ${sc.visual} (${sc.shotType})
${sc.aiImagePrompt ? `- AI Image Prompt: ${sc.aiImagePrompt}` : ""}
${sc.aiVideoPrompt ? `- AI Video Prompt: ${sc.aiVideoPrompt}` : ""}
- SFX: ${sc.sfx}
- Music Cue: ${sc.musicCue}
- Editing Note: ${sc.editingNote}
`).join("\n")}

---

## 4. Master AI Editor Prompt
${blueprint.finalAiEditorPrompt}
`;

    const blob = new Blob([pack], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_short_blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (state.topic || state.title) {
      handleGenerate(state.topic || state.title);
    }
  }, [state.topic, state.title]);

  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // Fallback
    }
  };

  const activeHook = blueprint?.hooks.options.find((h) => h.id === selectedHookId) || blueprint?.hooks.options[0];

  const getMethodBadge = (method: ShortsProductionMethod) => {
    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700,
    };

    switch (method) {
      case "SHOOT YOURSELF":
        return (
          <span style={{ ...baseStyle, background: "rgba(56, 189, 248, 0.15)", color: "var(--accent)" }}>
            <Camera size={12} /> Shoot Yourself
          </span>
        );
      case "SCREEN RECORD":
        return (
          <span style={{ ...baseStyle, background: "rgba(168, 85, 247, 0.15)", color: "#C084FC" }}>
            <Monitor size={12} /> Screen Record
          </span>
        );
      case "B-ROLL":
        return (
          <span style={{ ...baseStyle, background: "rgba(255, 255, 255, 0.08)", color: "var(--text)" }}>
            <Video size={12} /> B-Roll
          </span>
        );
      case "AI IMAGE":
        return (
          <span style={{ ...baseStyle, background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
            <Sparkles size={12} /> AI Image
          </span>
        );
      case "AI VIDEO":
        return (
          <span style={{ ...baseStyle, background: "rgba(236, 72, 153, 0.15)", color: "#F472B6" }}>
            <Wand2 size={12} /> AI Video
          </span>
        );
      case "MOTION GRAPHIC":
        return (
          <span style={{ ...baseStyle, background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
            <Layers size={12} /> Motion Graphic
          </span>
        );
      default:
        return (
          <span style={{ ...baseStyle, background: "var(--surface-2)", color: "var(--muted)" }}>
            {method}
          </span>
        );
    }
  };

  const filteredTimeline = (blueprint?.timeline || []).filter((s) => {
    if (activeSceneFilter === "ALL") return true;
    return s.productionMethod === activeSceneFilter;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Project & Creator Profile Context Bar */}
      {activeProject && (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FolderGit2 size={15} color="#38bdf8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
              PROJECT: {activeProject.title}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
              }}
            >
              {activeProject.status}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11.5 }}>
            <button
              onClick={() => navigate("/packaging", { state: { projectId: activeProject.id } })}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Packaging {activeProject.packaging ? "✓" : "○"}
            </button>
            <button
              onClick={() => navigate("/script", { state: { projectId: activeProject.id } })}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Long-Form {activeProject.longFormScript ? "✓" : "○"}
            </button>
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>
              Shorts Studio (Active)
            </span>
          </div>
        </div>
      )}

      {/* Creator Profile Memory Banner */}
      <div
        style={{
          background: "rgba(56, 189, 248, 0.04)",
          border: "1px solid rgba(56, 189, 248, 0.12)",
          borderRadius: "var(--radius-md)",
          padding: "6px 12px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11.5,
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <User size={13} color="#38bdf8" />
          <span>
            <strong>Creator Memory:</strong> {user?.niche ? user.niche.slice(0, 26) : "Tech & Education"} • Language: <strong>{language}</strong> • Tone: <strong>{user?.tone || "Direct & Punchy"}</strong>
          </span>
        </div>
        <button
          onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", color: "#38bdf8", fontWeight: 600, cursor: "pointer", fontSize: 11 }}
        >
          [ Override ]
        </button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ padding: 6, borderRadius: 8, background: "rgba(56, 189, 248, 0.12)", color: "var(--accent)" }}>
              <Clapperboard size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
              Shorts Studio
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            Turn raw concepts into human, research-aware, production-ready 9:16 short video blueprints.
          </p>
        </div>

        {blueprint && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              onClick={handleSaveToProject}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                background: savedSuccess ? "rgba(16, 185, 129, 0.15)" : undefined,
                color: savedSuccess ? "#34d399" : undefined,
                borderColor: savedSuccess ? "#34d399" : undefined,
              }}
            >
              {savedSuccess ? <Check size={14} /> : <Save size={14} />}
              {savedSuccess ? "Saved to Project!" : "Save to Project"}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleCreateThumbnail}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              <Layers size={14} color="#f59e0b" /> Create Thumbnail
            </button>
            <button
              className="btn btn-outline"
              onClick={handleExportMarkdown}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              <Download size={14} /> Export Blueprint
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setShowTeleprompter(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              <Smartphone size={14} /> Teleprompter Mode
            </button>
            <button
              className="btn btn-primary"
              onClick={() => copyToClipboard(blueprint.finalAiEditorPrompt, "all-prompt")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              {copiedSection === "all-prompt" ? <Check size={14} /> : <Copy size={14} />} Copy AI Editor Prompt
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={clearError} onRetry={() => handleGenerate()} />}

      {/* Configuration & Input Bar */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>
                Short Video Topic or Raw Premise
              </label>
              <input
                className="input"
                placeholder="e.g. Why BCA students struggle to get tech internships..."
                value={topic}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleGenerate()}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              style={{ minWidth: 170, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Directing...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Blueprint
                </>
              )}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                Creator Mode
              </label>
              <select
                className="input-select"
                value={creatorMode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCreatorMode(e.target.value as ShortsCreatorMode)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                {CREATOR_MODES.map((m) => (
                  <option key={m.mode} value={m.mode}>
                    {m.label} ({m.mode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                Target Duration
              </label>
              <select
                className="input-select"
                value={duration}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setDuration(e.target.value as ShortsDuration)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                {DURATIONS.map((d) => (
                  <option key={d.duration} value={d.duration}>
                    {d.label} - {d.words}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                Language
              </label>
              <select
                className="input-select"
                value={language}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as "English" | "Hindi" | "Hinglish")}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                <option value="Hinglish">Hinglish (Natural Creator Blend)</option>
                <option value="Hindi">Hindi (हिंदी - Spoken Hindi)</option>
                <option value="English">English (Global Conversational)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
              <input
                type="checkbox"
                id="researchModeToggle"
                checked={researchMode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setResearchMode(e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="researchModeToggle" style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>
                <Search size={12} className="inline mr-1 text-accent" /> Research Mode (Verify Facts)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Content Display */}
      {blueprint && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Strategy Summary & Angle Card */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)", borderColor: "rgba(56, 189, 248, 0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 4 }}>
                    Content Angle & Premise
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
                    {blueprint.strategy.contentAngle}
                  </h3>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: 12, background: "rgba(56, 189, 248, 0.15)", color: "var(--accent)", fontSize: 11, fontWeight: 700 }}>
                  {blueprint.strategy.creatorMode}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                {blueprint.strategy.whyThisAngleWorks}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12 }}>
                <div style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Pacing:</span> <strong>{blueprint.strategy.pacing}</strong>
                </div>
                <div style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Audience:</span> <strong>{blueprint.strategy.targetAudience}</strong>
                </div>
                <div style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Goal:</span> <strong>{blueprint.strategy.goal}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>
                Production Specs
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Spoken Words:</span>
                  <strong>{blueprint.script.wordCount} words</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Estimated Duration:</span>
                  <strong>~{blueprint.script.estimatedSeconds}s ({blueprint.script.durationFormatted})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Cut Frequency:</span>
                  <strong>{blueprint.editing.cutFrequency}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Music Vibe:</span>
                  <strong>{blueprint.editing.audioDirection.musicMood}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Research Facts Box if enabled */}
          {blueprint.research && blueprint.research.verifiedFacts.length > 0 && (
            <div className="card" style={{ padding: 18, borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BookOpen size={16} color="#34D399" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#34D399" }}>
                  Verified Research & Context (Research Mode)
                </h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {blueprint.research.verifiedFacts.map((fact, idx) => (
                  <div key={idx} style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                      ✓ {fact.claim}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      Source: {fact.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Hook Engine */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={16} color="#F59E0B" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Hook Variations (0–3 Seconds Scroll-Stop)
                </h3>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Click a hook to make it active in your script
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
              {blueprint.hooks.options.map((h) => {
                const isSelected = h.id === selectedHookId;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHookId(h.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(56, 189, 248, 0.08)" : "var(--surface-2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: isSelected ? "var(--accent)" : "var(--surface-3)", color: isSelected ? "#000" : "var(--text)" }}>
                        {h.type}
                      </span>
                      {isSelected && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>✓ Active Hook</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6, lineHeight: 1.4 }}>
                      "{h.hookText}"
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                      {h.whyItWorks}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: 6 }}>
            {[
              { id: "timeline", label: "Scene Timeline", icon: Video },
              { id: "script", label: "Spoken Script", icon: FileText },
              { id: "visuals", label: "Visuals & Prompts", icon: Sparkles },
              { id: "editing", label: "Editing & Audio", icon: Scissors },
              { id: "checklist", label: "Production Checklist", icon: ListChecks },
              { id: "ai-prompt", label: "AI Editor Prompt", icon: Copy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    color: isActive ? "var(--accent)" : "var(--muted)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: SCENE TIMELINE */}
          {activeTab === "timeline" && (
            <div>
              {/* Method Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", marginRight: 6 }}>Filter Shots:</span>
                {["ALL", "SHOOT YOURSELF", "SCREEN RECORD", "B-ROLL", "AI IMAGE", "AI VIDEO", "MOTION GRAPHIC"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveSceneFilter(f)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      border: activeSceneFilter === f ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: activeSceneFilter === f ? "rgba(56, 189, 248, 0.15)" : "var(--surface-2)",
                      color: activeSceneFilter === f ? "var(--accent)" : "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredTimeline.map((scene) => (
                  <div key={scene.sceneNumber} className="card" style={{ padding: 18, borderLeft: "4px solid var(--accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, background: "var(--surface-2)", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>
                          <Clock size={11} className="inline mr-1" /> {scene.timeRange}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                          Scene {scene.sceneNumber}: {scene.shotType}
                        </span>
                      </div>
                      {getMethodBadge(scene.productionMethod)}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                      <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
                          🗣️ Spoken Voiceover
                        </div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.5 }}>
                          "{scene.sceneNumber === 1 && activeHook ? activeHook.hookText : scene.voiceover}"
                        </p>
                      </div>

                      <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
                          🎬 Visual Action
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                          {scene.visual}
                        </p>
                      </div>
                    </div>

                    {/* Meta bar for scene */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, color: "var(--muted)", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                      {scene.onScreenText?.text && (
                        <div>
                          <strong>Text Overlay:</strong> <span style={{ color: "#FFE600", fontWeight: 700 }}>"{scene.onScreenText.text}"</span>
                        </div>
                      )}
                      {scene.sfx && (
                        <div>
                          <strong>SFX:</strong> <Volume2 size={11} className="inline mr-1" /> {scene.sfx}
                        </div>
                      )}
                      {scene.editingNote && (
                        <div>
                          <strong>Cut:</strong> {scene.editingNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPOKEN SCRIPT */}
          {activeTab === "script" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Full Spoken Voiceover Script
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Natural spoken pacing (~{blueprint.script.estimatedSeconds} seconds, {blueprint.script.wordCount} words)
                  </span>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => copyToClipboard(blueprint.script.fullVoiceover, "voiceover")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                >
                  {copiedSection === "voiceover" ? <Check size={14} /> : <Copy size={14} />} Copy Script
                </button>
              </div>

              <div
                style={{
                  background: "var(--surface-2)",
                  padding: 20,
                  borderRadius: 8,
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--text)",
                }}
              >
                {blueprint.timeline.map((s, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginRight: 8, userSelect: "none" }}>
                      [{s.timeRange}]
                    </span>
                    <span>{idx === 0 && activeHook ? activeHook.hookText : s.voiceover}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VISUALS & AI PROMPTS */}
          {activeTab === "visuals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {blueprint.timeline.map((scene) => (
                <div key={scene.sceneNumber} className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: "var(--surface-2)", fontSize: 11, fontWeight: 700 }}>
                        {scene.timeRange}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Scene {scene.sceneNumber}: {scene.shotType}</span>
                    </div>
                    {getMethodBadge(scene.productionMethod)}
                  </div>

                  <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 12px 0" }}>
                    <strong>Action:</strong> {scene.visual}
                  </p>

                  {/* If AI Image or Video prompt is available */}
                  {(scene.aiImagePrompt || scene.aiVideoPrompt || scene.productionMethod === "AI IMAGE" || scene.productionMethod === "AI VIDEO") && (
                    <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px dashed var(--accent)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
                          ✨ 9:16 Vertical AI Generation Prompt
                        </span>
                        <button
                          className="btn btn-ghost"
                          onClick={() => copyToClipboard(scene.aiImagePrompt || scene.aiVideoPrompt || `Vertical 9:16 ${scene.visual}`, `prompt-${scene.sceneNumber}`)}
                          style={{ padding: "2px 8px", fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          {copiedSection === `prompt-${scene.sceneNumber}` ? <Check size={12} /> : <Copy size={12} />} Copy Prompt
                        </button>
                      </div>
                      <code style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, display: "block" }}>
                        {scene.aiImagePrompt || scene.aiVideoPrompt || `Vertical 9:16 realistic shot of ${scene.visual}. Photorealistic, natural lighting, documentary style, 8k resolution, clean negative space, no text.`}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EDITING & AUDIO */}
          {activeTab === "editing" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Scissors size={16} color="var(--accent)" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Editing & Cuts Direction</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Pacing:</span>
                    <strong>{blueprint.editing.pacing}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Cut Frequency:</span>
                    <strong>{blueprint.editing.cutFrequency}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Recommended Transitions:</span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      {blueprint.editing.transitions.map((t, idx) => (
                        <li key={idx}><strong>{t}</strong></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Caption Strategy:</span>
                    <strong>{blueprint.editing.captionStrategy.style}</strong>
                    <div style={{ marginTop: 4 }}>
                      Highlight Keywords: {blueprint.editing.captionStrategy.highlightKeywords.map((k, i) => (
                        <span key={i} style={{ background: "rgba(255, 230, 0, 0.15)", color: "#FFE600", padding: "2px 6px", borderRadius: 4, marginRight: 6, fontWeight: 700 }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Music size={16} color="var(--accent)" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Audio & Sound Design</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Voice Delivery Style:</span>
                    <strong>{blueprint.editing.audioDirection.voiceStyle}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Music Track Style:</span>
                    <strong>{blueprint.editing.audioDirection.musicGenre} (~{blueprint.editing.audioDirection.targetBpm} BPM)</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Intensity Curve:</span>
                    <strong>{blueprint.editing.audioDirection.intensityCurve}</strong>
                  </div>
                  {blueprint.editing.audioDirection.sfxList.length > 0 && (
                    <div>
                      <span style={{ color: "var(--muted)", display: "block" }}>Sound Effects Cues:</span>
                      <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                        {blueprint.editing.audioDirection.sfxList.map((s, idx) => (
                          <li key={idx}>[{s.time}] <strong>{s.sfx}</strong> — {s.purpose}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTION CHECKLIST */}
          {activeTab === "checklist" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                  1. Before Recording
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
                  {blueprint.production.beforeRecording.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                  2. During Recording
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
                  {blueprint.production.duringRecording.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                  3. After Recording & Edit
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
                  {blueprint.production.afterRecording.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: MASTER AI EDITOR PROMPT */}
          {activeTab === "ai-prompt" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Master AI Video Editor Prompt
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Paste this directly into CapCut AI, InVideo, Runway, Pika, or send to your video editor
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(blueprint.finalAiEditorPrompt, "master-prompt")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                >
                  {copiedSection === "master-prompt" ? <Check size={14} /> : <Copy size={14} />} Copy Master Prompt
                </button>
              </div>

              <textarea
                readOnly
                value={blueprint.finalAiEditorPrompt}
                style={{
                  width: "100%",
                  height: 380,
                  padding: 14,
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: 1.6,
                  resize: "vertical",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Teleprompter Modal */}
      {showTeleprompter && blueprint && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
          }}
        >
          <div style={{ position: "absolute", top: 20, right: 30, display: "flex", gap: 12 }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowTeleprompter(false)}
              style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              Close Teleprompter
            </button>
          </div>

          <div style={{ maxWidth: 720, width: "100%", textAlign: "center", overflowY: "auto", maxHeight: "80vh", padding: "20px 0" }}>
            <div style={{ fontSize: 14, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
              Teleprompter ({blueprint.script.durationFormatted} - {blueprint.script.wordCount} Words)
            </div>
            {blueprint.timeline.map((s, idx) => (
              <div key={idx} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                  [{s.timeRange}]
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.6 }}>
                  {idx === 0 && activeHook ? activeHook.hookText : s.voiceover}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
