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
  Save,
  Eye,
  X,
  BookOpen,
} from "lucide-react";
import { ErrorBanner } from "../components/SharedUI";
import { api } from "../lib/client";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";
import ProjectWorkflowBar from "../components/ProjectWorkflowBar";
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
  const [topic, setTopic] = useState(passedBaseTopic || passedTitle || activeProject?.topic || "Why Senior Developers Write Less Code");
  const [audience, setAudience] = useState(passedAudience || activeProject?.targetAudience || user?.target_audience || "Software engineers and learners");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">(activeProject?.language || "English");
  const [duration, setDuration] = useState<"5-8 minutes" | "8-12 minutes" | "12-15 minutes">("8-12 minutes");
  const [mode, setMode] = useState<"outline" | "full">("full");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  const { loading, error, clearError, run } = useTask();

  useEffect(() => {
    if (passedTitle) setTitle(passedTitle);
    if (passedBaseTopic) setTopic(passedBaseTopic);
    if (passedAudience) setAudience(passedAudience);
  }, [passedTitle, passedBaseTopic, passedAudience]);

  const generate = async (customMode?: "outline" | "full") => {
    const targetMode = customMode || mode;
    if (!topic.trim() && !title.trim()) return;

    clearError();
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

      if (activeProject) {
        updateProject(activeProject.id, {
          title: parsed.title || title || topic,
          status: "Writing",
          progressPercent: Math.max(activeProject.progressPercent || 0, 85),
          longFormScript: {
            title: parsed.title || title || topic,
            hook: parsed.hook,
            intro: parsed.intro,
            sections: (parsed.sections || []).map((s, idx) => ({
              id: `sec_${idx + 1}`,
              heading: s.heading,
              goal: s.purpose || "",
              spokenVoiceover: s.content,
              visualCue: s.retentionOpportunity || "",
            })),
            cta: parsed.cta,
            estimatedMinutes: 8,
          },
        });
      }
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

  const copyFullScript = () => {
    if (!script) return;
    const fullText = [
      `TITLE: ${script.title || title || topic}`,
      `CORE TOPIC: ${script.topic || topic}`,
      `TARGET AUDIENCE: ${script.audience || audience}`,
      `LANGUAGE: ${script.language || language}`,
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
      `**Target Audience:** ${script.audience || audience} | **Language:** ${script.language || language}`,
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

  // Approximate spoken reading words and duration
  const totalWords = script
    ? `${script.hook} ${script.intro} ${script.sections?.map((s) => s.content).join(" ") || ""} ${script.cta}`.trim().split(/\s+/).length
    : 0;
  const estimatedReadMinutes = Math.round((totalWords / 140) * 10) / 10;

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 1160,
        margin: "0 auto",
        paddingBottom: 60,
      }}
    >
      {/* ── 1. Top Workflow Bar ────────────────────────────────────── */}
      <ProjectWorkflowBar
        currentPhase="script"
        onNextPhase={() => {
          handleSaveToProject();
          navigate("/packaging", {
            state: {
              projectId: activeProject?.id,
              topic: script?.topic || topic,
              title: script?.title || title,
            },
          });
        }}
        nextPhaseLabel="Packaging & Titles →"
      />

      {/* ── 2. Studio Title & Actions ──────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FileText size={22} color="var(--accent-blue)" />
            <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: 0 }}>
              Full Video Script Studio
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Generate and edit long-form scripts structured for maximum viewer retention, pacing, and B-roll cues
          </p>
        </div>

        {script && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowTeleprompter(true)}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
            >
              <Eye size={14} /> Teleprompter Mode
            </button>

            <button
              onClick={copyFullScript}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
            >
              {copied ? <Check size={14} color="var(--accent-mint)" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Full Script"}
            </button>

            <button
              onClick={downloadScript}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
            >
              <Download size={14} /> Download .md
            </button>

            <button
              onClick={handleSaveToProject}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
            >
              {savedSuccess ? <Check size={14} color="var(--accent-mint)" /> : <Save size={14} />}
              {savedSuccess ? "Saved!" : "Save to Project"}
            </button>

            <button
              onClick={() => navigate("/packaging", { state: { projectId: activeProject?.id, title: script.title || title } })}
              className="btn btn-primary"
              style={{ fontSize: 13, gap: 6 }}
            >
              <Layers size={14} /> Design Thumbnail & Titles →
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      {/* ── 3. Configuration & Generation Card ─────────────────────── */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "20px 22px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
              Video Concept or Working Title
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="e.g. Why Senior Developers Write Less Code..."
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={() => generate()}
            disabled={loading || !topic.trim()}
            className="btn btn-primary"
            style={{ height: 44, padding: "0 22px", fontSize: 13.5, gap: 6 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {loading ? "Writing Script..." : "Generate Script"}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Target Length
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              <option value="5-8 minutes">5–8 Minutes (Punchy Breakdown)</option>
              <option value="8-12 minutes">8–12 Minutes (Standard Deep Dive)</option>
              <option value="12-15 minutes">12–15 Minutes (Comprehensive Masterclass)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Language & Cadence
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              <option value="English">English (Global Technical)</option>
              <option value="Hinglish">Hinglish (Natural Creator Conversation)</option>
              <option value="Hindi">Hindi (हिंदी - Spoken Hindi)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Generation Mode
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setMode("full")}
                className={`btn ${mode === "full" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, height: 38, fontSize: 12 }}
              >
                Full Word-for-Word
              </button>
              <button
                type="button"
                onClick={() => setMode("outline")}
                className={`btn ${mode === "outline" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, height: 38, fontSize: 12 }}
              >
                Bullet Outline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Script Document Display ─────────────────────────────── */}
      {script ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Read Time & Stats Banner */}
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 12.5,
              color: "var(--text-secondary)",
            }}
          >
            <div>
              Spoken Word Count: <strong style={{ color: "var(--text)" }}>{totalWords} words</strong> •
              Estimated Duration: <strong style={{ color: "var(--accent-mint)" }}>~{estimatedReadMinutes} minutes</strong> (at ~140 wpm cadence)
            </div>

            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {script.sections?.length || 0} Body Sections
            </span>
          </div>

          {/* Section 1: 0–15s Hook */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-amber)", textTransform: "uppercase" }}>
                Act 1: Verbal Hook (0:00 – 0:15)
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(script.hook)}
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                title="Copy hook"
              >
                <Copy size={13} />
              </button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.6 }}>
              "{script.hook}"
            </div>
          </div>

          {/* Section 2: Intro & Premise */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-blue)", textTransform: "uppercase" }}>
                Act 2: Premise & Stakes (0:15 – 0:45)
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(script.intro)}
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                title="Copy intro"
              >
                <Copy size={13} />
              </button>
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {script.intro}
            </div>
          </div>

          {/* Section 3: Body Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>
              Core Narrative Sections
            </h3>

            {script.sections?.map((section, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 22px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                      SECTION {idx + 1}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                      {section.heading}
                    </h4>
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(section.content)}
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    title="Copy section"
                  >
                    <Copy size={13} />
                  </button>
                </div>

                {section.purpose && (
                  <div style={{ fontSize: 11.5, color: "var(--accent-mint)", fontWeight: 600 }}>
                    Goal: {section.purpose}
                  </div>
                )}

                <div style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {section.content}
                </div>

                {section.retentionOpportunity && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    <strong>Visual Cue / B-Roll:</strong> {section.retentionOpportunity}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Section 4: Call to Action (CTA) */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-mint)", textTransform: "uppercase" }}>
                Payoff & Call to Action (CTA)
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(script.cta)}
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                title="Copy CTA"
              >
                <Copy size={13} />
              </button>
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text)", lineHeight: 1.6 }}>
              "{script.cta}"
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BookOpen size={32} color="var(--accent-blue)" />
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Ready to Script Your Video</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 460, margin: 0 }}>
            Enter a topic above or launch directly from an idea. Wavelength will generate a multi-section, retention-paced spoken script.
          </p>
        </div>
      )}

      {/* ── 5. Fullscreen Teleprompter Mode ────────────────────────── */}
      {showTeleprompter && script && (
        <div className="teleprompter-modal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-blue)", letterSpacing: "0.08em" }}>
                Rehearsal / Teleprompter Mode
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0 0", color: "#fff" }}>
                {script.title || title || topic}
              </h2>
            </div>

            <button
              onClick={() => setShowTeleprompter(false)}
              className="icon-btn"
              style={{ color: "#fff" }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="teleprompter-content">
            <div style={{ fontSize: 24, lineHeight: 1.9, color: "#f8fafc" }}>
              <p style={{ color: "var(--accent-amber)", marginBottom: 30 }}>"{script.hook}"</p>
              <p style={{ marginBottom: 30 }}>{script.intro}</p>
              {script.sections?.map((s, idx) => (
                <div key={idx} style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", marginBottom: 8 }}>
                    Section {idx + 1}: {s.heading}
                  </div>
                  <p>{s.content}</p>
                </div>
              ))}
              <p style={{ color: "var(--accent-mint)", marginTop: 30 }}>"{script.cta}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}