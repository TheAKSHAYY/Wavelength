import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  FolderGit2,
  User,
  Save,
  Clapperboard,
} from "lucide-react";
import { ErrorBanner, EmptyState, Pill } from "../components/SharedUI";
import { api } from "../lib/client";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";
import type { Script } from "../types";

export default function ScriptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeProject, updateProject, createProject, setCurrentProject } = useStore();
  const passedTitle = (location.state as { topic?: string; title?: string })?.title || (location.state as { topic?: string })?.topic || "";
  const passedBaseTopic = (location.state as { baseTopic?: string })?.baseTopic || "";
  const passedAudience = (location.state as { audience?: string })?.audience || "";
  const passedAngle = (location.state as { angle?: string })?.angle || "";

  const [script, setScript] = useAppState("script");
  const [title, setTitle] = useState(passedTitle || activeProject?.title || "");
  const [topic, setTopic] = useState(passedBaseTopic || passedTitle || activeProject?.topic || "Java DSA");
  const [audience, setAudience] = useState(passedAudience || activeProject?.targetAudience || user?.target_audience || "Students and beginners");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">(activeProject?.language || "English");
  const [duration, setDuration] = useState<"5-8 minutes" | "8-12 minutes" | "12-15 minutes">("8-12 minutes");
  const [mode, setMode] = useState<"outline" | "full">("full");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const openThumbnailStudio = () => {
    navigate("/packaging", {
      state: {
        title: script?.title || title || topic,
        hook: script?.hook || "",
        topic: topic || title,
        audience: script?.audience || audience,
        angle: passedAngle,
        projectId: activeProject?.id,
      },
    });
  };

  const handleCreateShortsFromVideo = () => {
    navigate("/shorts", {
      state: {
        title: script?.title || title || topic,
        topic: topic || title,
        hook: script?.hook || "",
        angle: passedAngle,
        projectId: activeProject?.id,
      },
    });
  };

  const handleSaveToProject = () => {
    if (!script) return;
    const longFormObj = {
      title: script.title || title || topic,
      hook: script.hook,
      intro: script.intro,
      sections: (script.sections || []).map((s, idx) => ({
        id: `sec_${idx + 1}`,
        heading: s.heading,
        goal: s.purpose || "",
        spokenVoiceover: s.content,
        visualCue: s.retentionOpportunity || "",
      })),
      cta: script.cta,
      estimatedMinutes: Number((totalWords / 140).toFixed(1)) || 8,
    };

    if (activeProject) {
      updateProject(activeProject.id, {
        longFormScript: longFormObj,
        title: script.title || title || activeProject.title,
        progressPercent: Math.max(activeProject.progressPercent || 0, 85),
        status: "Writing",
      });
    } else {
      const proj = createProject({
        title: script.title || title || topic,
        topic: topic || title,
        contentType: "Full Video",
        longFormScript: longFormObj,
        progressPercent: 85,
        status: "Writing",
      });
      setCurrentProject(proj.id);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };
  const { loading, error, clearError, run } = useTask();

  useEffect(() => {
    if (passedTitle) setTitle(passedTitle);
    if (passedBaseTopic) setTopic(passedBaseTopic);
    if (passedAudience) setAudience(passedAudience);
  }, [passedTitle, passedBaseTopic, passedAudience]);

  const generate = async (customMode?: "outline" | "full") => {
    const targetMode = customMode || mode;
    if (!topic.trim() && !title.trim()) return;

    await run(async () => {
      const parsed = await api.post<Script>("/api/generate/script", {
        topic: topic.trim() || title.trim(),
        title: title.trim() || topic.trim(),
        audience: audience.trim(),
        angle: passedAngle,
        language,
        duration,
        mode: targetMode,
      });
      setScript(parsed);
    });
  };

  const copyFullScript = () => {
    if (!script) return;
    const fullText = [
      `TITLE: ${script.title || title || topic}`,
      `CORE TOPIC: ${script.topic || topic}`,
      `TARGET AUDIENCE: ${script.audience || audience}`,
      `LANGUAGE: ${script.language || language}`,
      `FORMAT: ${script.format || "Creator Guide"}`,
      `\n--- HOOK (0:00 - 0:15) ---\n${script.hook}`,
      `\n--- INTRO & PREMISE (0:15 - 0:45) ---\n${script.intro}`,
      `\n--- MAIN CONTENT ---`,
      ...(script.sections || []).map((s, idx) => `\n[SECTION ${idx + 1}: ${s.heading}]\n${s.purpose ? `Purpose: ${s.purpose}\n` : ""}${s.content}`),
      `\n--- CALL TO ACTION ---\n${script.cta}`,
      script.chapters && script.chapters.length > 0 ? `\n--- CHAPTERS ---\n${script.chapters.join("\n")}` : "",
    ].join("\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    if (!script) return;
    const fullText = [
      `# ${script.title || title || topic}`,
      `**Core Topic:** ${script.topic || topic}`,
      `**Target Audience:** ${script.audience || audience} | **Language:** ${script.language || language} | **Format:** ${script.format || "Creator Guide"}`,
      `\n## HOOK (0:00 - 0:15)\n${script.hook}`,
      `\n## INTRO & PREMISE (0:15 - 0:45)\n${script.intro}`,
      `\n## MAIN CONTENT`,
      ...(script.sections || []).map((s, idx) => `\n### Section ${idx + 1}: ${s.heading}\n${s.purpose ? `*Purpose: ${s.purpose}*\n\n` : ""}${s.content}`),
      `\n## CALL TO ACTION\n${script.cta}`,
      script.chapters && script.chapters.length > 0 ? `\n## CHAPTERS\n${script.chapters.join("\n")}` : "",
    ].join("\n");

    const blob = new Blob([fullText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(script.title || title || topic).toLowerCase().replace(/[^a-z0-9]/g, "-")}-script.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate approximate words and spoken time
  const totalWords = script
    ? `${script.hook} ${script.intro} ${script.sections.map((s) => s.content).join(" ")} ${script.cta}`.split(/\s+/).length
    : 0;
  const estMinutes = (totalWords / 140).toFixed(1);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Project & Creator Profile Context Bar */}
      {activeProject && (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FolderGit2 size={15} color="#a855f7" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
              PROJECT: {activeProject.title}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
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
            <span style={{ color: "#a855f7", fontWeight: 700 }}>
              Long-Form Studio (Active)
            </span>
            <button
              onClick={() => navigate("/shorts", { state: { projectId: activeProject.id } })}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Shorts {(activeProject.shorts?.length || 0) > 0 ? "✓" : "○"}
            </button>
          </div>
        </div>
      )}

      {/* Creator Profile Memory Banner */}
      <div
        style={{
          background: "rgba(168, 85, 247, 0.04)",
          border: "1px solid rgba(168, 85, 247, 0.12)",
          borderRadius: "var(--radius-md)",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11.5,
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <User size={13} color="#a855f7" />
          <span>
            <strong>Creator Memory:</strong> {user?.niche ? user.niche.slice(0, 26) : "Tech & Education"} • Audience: <strong>{audience}</strong> • Language: <strong>{language}</strong>
          </span>
        </div>
        <button
          onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", color: "#a855f7", fontWeight: 600, cursor: "pointer", fontSize: 11 }}
        >
          [ Override ]
        </button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#a855f7",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              STUDIO · LONG-FORM SCRIPTING
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
            Long-Form Studio
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            Dynamic retention-focused scriptwriting engine tailored to your exact video title, topic, audience, and language.
          </p>
        </div>

        {script && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleSaveToProject}
              className="btn btn-outline"
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
              onClick={openThumbnailStudio}
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              <ImageIcon size={14} color="#f59e0b" /> Create Thumbnail
            </button>
            <button
              onClick={handleCreateShortsFromVideo}
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              <Clapperboard size={14} color="#38bdf8" /> Create Shorts from Video
            </button>
          </div>
        )}
      </div>

      {/* Context Inputs Card */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Video Title
            </label>
            <input
              className="input"
              style={{ width: "100%", fontSize: 13.5 }}
              placeholder="e.g. Stop Using ChatGPT for College: Use These Specialized AI Tools Instead"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Core Topic / Subject
            </label>
            <input
              className="input"
              style={{ width: "100%", fontSize: 13.5 }}
              placeholder="e.g. AI tools for students, Java DSA, Python Automation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Target Audience
            </label>
            <input
              className="input"
              style={{ width: "100%", fontSize: 13.5 }}
              placeholder="e.g. College students, beginner developers"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Script Language
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["English", "Hinglish", "Hindi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    flex: 1,
                    padding: "8px 6px",
                    borderRadius: "var(--radius-md)",
                    background: language === lang ? "var(--accent-primary-dim, rgba(56, 189, 248, 0.15))" : "var(--surface-2)",
                    border: language === lang ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                    color: language === lang ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: language === lang ? 600 : 500,
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Target Duration
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["5-8 minutes", "8-12 minutes", "12-15 minutes"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "var(--radius-md)",
                    background: duration === d ? "var(--accent-mint-dim, rgba(52, 211, 153, 0.15))" : "var(--surface-2)",
                    border: duration === d ? "1px solid var(--accent-mint, #34d399)" : "1px solid var(--border)",
                    color: duration === d ? "var(--accent-mint, #34d399)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontWeight: duration === d ? 600 : 500,
                  }}
                >
                  {d.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 3, borderRadius: "var(--radius-md)", flexWrap: "wrap" }}>
            <button
              onClick={() => setMode("outline")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: mode === "outline" ? "var(--surface-1)" : "transparent",
                color: mode === "outline" ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: mode === "outline" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <Layers size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} /> Script Outline
            </button>
            <button
              onClick={() => setMode("full")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: mode === "full" ? "var(--surface-1)" : "transparent",
                color: mode === "full" ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: mode === "full" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <FileText size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} /> Full Spoken Script
            </button>
          </div>

          <button
            className="btn"
            onClick={() => generate()}
            disabled={loading || (!topic.trim() && !title.trim())}
            style={{ padding: "10px 24px", fontSize: 13.5 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {loading ? "Crafting Script..." : mode === "outline" ? "Generate Outline" : "Generate Full Script"}
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={clearError} />

      {!script && !loading && (
        <EmptyState text="Enter your video title and topic above to draft a creator-grade, retention-focused script." />
      )}

      {loading && (
        <div className="card" style={{ padding: "36px 24px", textAlign: "center" }}>
          <Loader2 size={28} className="spin" style={{ color: "var(--accent-primary, #38bdf8)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Crafting retention-optimized {mode} script...</div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
            Tailoring natural hook, spoken transitions, and honest trade-offs for {title || topic}
          </div>
        </div>
      )}

      {/* Script Display Output */}
      {script && !loading && (
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Header Metadata Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <Pill>{script.format || "Creator Guide"}</Pill>
                <span style={{ color: "var(--text-dim)" }}>·</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Audience: <strong>{script.audience || audience}</strong>
                </span>
                <span style={{ color: "var(--text-dim)" }}>·</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Language: <strong>{script.language || language}</strong>
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                {script.title || title || topic}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Word count & Spoken time tracker */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                <Clock size={13} color="var(--accent-primary)" />
                <span>
                  ~<strong>{totalWords}</strong> words (~{estMinutes} mins)
                </span>
              </div>

              <button
                onClick={copyFullScript}
                className="btn btn-ghost"
                style={{ padding: "6px 12px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                {copied ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={openThumbnailStudio}
                className="btn"
                style={{
                  padding: "6px 12px",
                  fontSize: 12.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
                  color: "#fff",
                }}
              >
                <ImageIcon size={13} /> Studio Thumbnail
              </button>

              <button
                onClick={downloadScript}
                className="btn btn-ghost"
                style={{ padding: "6px 12px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <Download size={13} /> Export .MD
              </button>
            </div>
          </div>

          {/* Quality Breakdown Indicator */}
          {script.qualityScore && (
            <div
              style={{
                display: "flex",
                gap: 14,
                padding: "10px 14px",
                background: "rgba(52, 211, 153, 0.04)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent-mint, #34d399)", fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Quality Score: {script.qualityScore.overall}/100
              </div>
              <span style={{ color: "var(--text-dim)" }}>|</span>
              <span style={{ color: "var(--text-secondary)" }}>
                Topic Relevance: <strong>{script.qualityScore.relevance}%</strong>
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Retention Strength: <strong>{script.qualityScore.retention}%</strong>
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Naturalness: <strong>{script.qualityScore.naturalness}%</strong>
              </span>
            </div>
          )}

          {/* Script Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, lineHeight: 1.6 }}>
            {/* HOOK */}
            <div style={{ background: "var(--surface-2)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ color: "var(--accent-mint, #34d399)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 800 }}>
                  ⚡ RETENTION HOOK (0:00 - 0:15)
                </span>
                <button
                  onClick={openThumbnailStudio}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: "rgba(56, 189, 248, 0.12)",
                    color: "var(--accent-primary, #38bdf8)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  <ImageIcon size={12} /> Craft Matching Thumbnail
                </button>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--text-primary)" }}>{script.hook}</div>
            </div>

            {/* INTRO */}
            <div style={{ background: "var(--surface-2)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: "var(--accent-primary, #38bdf8)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 800 }}>
                  📖 PREMISE & ROADMAP (0:15 - 0:45)
                </span>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Value proposition</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>{script.intro}</div>
            </div>

            {/* MAIN SECTIONS */}
            {(script.sections || []).map((s, i) => (
              <div
                key={i}
                style={{ background: "var(--surface-2)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ color: "var(--accent-amber, #fbbf24)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 800 }}>
                    SECTION {i + 1}: {s.heading?.toUpperCase()}
                  </span>
                  {s.purpose && (
                    <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                      🎯 {s.purpose}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.65 }}>{s.content}</div>
              </div>
            ))}

            {/* CTA */}
            <div style={{ background: "var(--surface-2)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--accent-mint, #34d399)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 800 }}>
                🎯 CALL TO ACTION
              </span>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6 }}>{script.cta}</div>
            </div>

            {/* CHAPTERS */}
            {script.chapters && script.chapters.length > 0 && (
              <div style={{ background: "var(--surface-1)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 800, textTransform: "uppercase" }}>
                  ⏱️ YOUTUBE CHAPTERS
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
                  {script.chapters.map((c, i) => (
                    <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-secondary)" }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Step Transition to Content Calendar */}
            <div
              style={{
                marginTop: 12,
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Script Ready for Production</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Add this video to your publishing calendar to track production and release dates.</div>
              </div>
              <button
                onClick={() => navigate("/calendar", { state: { newTitle: script.title || title || topic, newTopic: topic } })}
                className="btn btn-primary"
                style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Add to Content Calendar →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}