import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Loader2,
  Download,
  Sparkles,
  RefreshCw,
  Zap,
  Type,
  ShieldCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader, ErrorBanner, CopyButton } from "../components/SharedUI";
import { useTask } from "../lib/hooks";
import { api } from "../lib/client";
import {
  generateImageUrl,
  preloadImage,
  downloadImageUrl,
  THUMBNAIL_PRESETS,
} from "../lib/imageGenerator";

type BadgePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-right";

const BADGE_POSITIONS: { value: BadgePosition; label: string }[] = [
  { value: "top-left", label: "Top-Left" },
  { value: "top-right", label: "Top-Right" },
  { value: "bottom-left", label: "Bottom-Left" },
  { value: "bottom-right", label: "Bottom-Right" },
  { value: "center-right", label: "Center-Right" },
];

interface ThumbnailBlueprint {
  objective?: {
    type: string;
    oneSecondPromise: string;
    emotionalTrigger: string;
  };
  visualStory?: {
    narrative: string;
    primaryFocalSubject: string;
    secondaryElements: string[];
    backgroundEnvironment: string;
    subjectPosition: "left" | "right" | "center" | "bottom" | "split";
  } | string;
  layout?: string;
  textStrategy?: {
    overlayText: string;
    characterCount: number;
    wordCount: number;
    layoutZone: string;
    textColor: string;
    pillColor?: string;
    textStroke: string;
    dropShadow: string;
  };
  qa?: {
    focalPointClarity: { passed: boolean; note: string };
    relevance: { passed: boolean; note: string };
    storyImmediacy: { passed: boolean; note: string };
    textBrevity: { passed: boolean; wordCount: number; note: string };
    mobileReadability: { passed: boolean; note: string };
    compositionBalance: { passed: boolean; layout: string; note: string };
    accuracyCheck: { passed: boolean; note: string };
    overallVerdict: string;
  };
  colorDirection?: {
    primary: string;
    secondary: string;
    accent: string;
    contrastRating: string;
  };
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    contrastRating: string;
  };
  enginePrompt: string;
  negativePrompt?: string;
  overlayText?: string;
  badgePosition?: BadgePosition;
  focalSubject?: string;
  backgroundScene?: string;
  composition?: {
    rule: string;
    layoutType: string;
    emotion: string;
  };
  ctrOptimizationTips?: string[];
}

const OVERLAY_TEXT_MAX_LEN = 30;

function slugify(text: string, fallback: string) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return cleaned || fallback;
}

export default function ImageGeneratorPage() {
  const location = useLocation();
  const state = (location.state || {}) as {
    prompt?: string;
    title?: string;
    topic?: string;
    script?: string;
    angle?: string;
    audience?: string;
  };

  const initialTopic = state.title || state.topic || "What They Actually Hide Inside Google Headquarters...";
  const [sourceTitle, setSourceTitle] = useState(state.title || state.topic || "");
  const [sourceTopic, setSourceTopic] = useState(state.topic || state.title || "");
  const [sourceScript, setSourceScript] = useState(state.script || "");

  const [prompt, setPrompt] = useState(
    state.prompt ||
      `16:9 YouTube thumbnail photography for "${initialTopic}". High-impact focal hero subject, dramatic lighting, clean negative space, 8k resolution.`
  );

  const [selectedPreset, setSelectedPreset] = useState(THUMBNAIL_PRESETS[0]);
  const [blueprint, setBlueprint] = useState<ThumbnailBlueprint | null>(null);
  const [craftingBlueprint, setCraftingBlueprint] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);

  // Overlay Text Controls
  const [overlayText, setOverlayText] = useState("");
  const [showOverlayBadge, setShowOverlayBadge] = useState(true);
  const [badgePosition, setBadgePosition] = useState<BadgePosition>("top-left");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { loading, error, run, clearError } = useTask();

  // If navigated with title/script, auto-craft thumbnail intelligence
  useEffect(() => {
    if (state.title || state.topic || state.script) {
      craftSynchronizedThumbnail();
    }
  }, [state.title, state.topic, state.script]);

  const handleTitleChange = (newTitle: string) => {
    setSourceTitle(newTitle);
    setSourceTopic(newTitle);
    clearError();
    setImageUrl(null);
    setBlueprint(null);
  };

  // Train and craft prompt from Title & Script using the Thumbnail Intelligence Pipeline
  const craftSynchronizedThumbnail = async () => {
    setCraftingBlueprint(true);
    clearError();
    setBlueprintError(null);

    try {
      const res = await api.post<ThumbnailBlueprint>("/api/generate/thumbnail-intelligence", {
        title: sourceTitle || sourceTopic || prompt,
        script: sourceScript,
        topic: sourceTopic || sourceTitle,
        stylePreset: selectedPreset.name,
        angle: state.angle,
        audience: state.audience,
      });

      setBlueprint(res);
      setPrompt(res.enginePrompt);
      if (res.overlayText || res.textStrategy?.overlayText) {
        setOverlayText((res.textStrategy?.overlayText || res.overlayText || "").slice(0, OVERLAY_TEXT_MAX_LEN));
      }
      if (res.badgePosition) {
        setBadgePosition(res.badgePosition);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Couldn't generate the thumbnail blueprint. Try again.";
      console.warn("Failed to generate thumbnail intelligence:", err);
      setBlueprintError(message);
    } finally {
      setCraftingBlueprint(false);
    }
  };

  const generate = () =>
    run(async () => {
      // Use clean prompt without duplicate generic buzzword stacking
      const targetPrompt = prompt.trim();
      const url = generateImageUrl(targetPrompt, {
        width: 1280,
        height: 720,
        model: "flux",
        negativePrompt: blueprint?.negativePrompt,
      });
      await preloadImage(url);
      setImageUrl(url);
    });

  const downloadImage = async () => {
    if (!imageUrl) return;
    const slug = slugify(sourceTitle || prompt, "thumbnail");
    await downloadImageUrl(imageUrl, `${slug}-${Date.now()}.jpg`);
  };

  const anyTaskRunning = loading || craftingBlueprint;

  // Dynamic Multi-Line High-CTR Text Overlay Engine
  const renderDynamicTextOverlay = () => {
    if (!showOverlayBadge || !overlayText.trim()) return null;

    const words = overlayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let line1 = "";
    let line2 = "";
    if (wordCount <= 2) {
      line1 = overlayText.trim();
    } else if (wordCount === 3) {
      line1 = words.slice(0, 2).join(" ");
      line2 = words.slice(2).join(" ");
    } else {
      const mid = Math.ceil(wordCount / 2);
      line1 = words.slice(0, mid).join(" ");
      line2 = words.slice(mid).join(" ");
    }

    const layout = blueprint?.layout || (badgePosition === "top-right" ? "RIGHT_TEXT_LEFT_SUBJECT" : "LEFT_TEXT_RIGHT_SUBJECT");
    
    let containerStyle: React.CSSProperties = {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      pointerEvents: "none",
      userSelect: "none",
      zIndex: 10,
      maxWidth: "52%",
    };

    switch (layout) {
      case "LEFT_TEXT_RIGHT_SUBJECT":
        containerStyle = { ...containerStyle, top: "20%", left: "5%", alignItems: "flex-start", textAlign: "left" };
        break;
      case "RIGHT_TEXT_LEFT_SUBJECT":
        containerStyle = { ...containerStyle, top: "20%", right: "5%", alignItems: "flex-end", textAlign: "right" };
        break;
      case "TOP_TEXT_BOTTOM_SUBJECT":
        containerStyle = { ...containerStyle, top: "8%", left: "50%", transform: "translateX(-50%)", alignItems: "center", textAlign: "center", maxWidth: "80%" };
        break;
      case "SPLIT_COMPARISON":
      case "CENTER_SUBJECT":
        containerStyle = { ...containerStyle, top: "10%", left: "50%", transform: "translateX(-50%)", alignItems: "center", textAlign: "center", maxWidth: "75%" };
        break;
      case "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE":
      default:
        if (badgePosition === "top-right") {
          containerStyle = { ...containerStyle, top: "8%", right: "5%", alignItems: "flex-end", textAlign: "right" };
        } else if (badgePosition === "bottom-left") {
          containerStyle = { ...containerStyle, bottom: "8%", left: "5%", alignItems: "flex-start", textAlign: "left" };
        } else if (badgePosition === "bottom-right") {
          containerStyle = { ...containerStyle, bottom: "8%", right: "5%", alignItems: "flex-end", textAlign: "right" };
        } else {
          containerStyle = { ...containerStyle, top: "8%", left: "5%", alignItems: "flex-start", textAlign: "left" };
        }
        break;
    }

    const textColor = blueprint?.textStrategy?.textColor || "#FFE600";
    const pillColor = blueprint?.textStrategy?.pillColor || "rgba(0, 0, 0, 0.82)";
    const fontSize = wordCount <= 2 ? "clamp(24px, 5vw, 56px)" : "clamp(18px, 3.8vw, 42px)";

    return (
      <div style={containerStyle}>
        <div
          style={{
            background: pillColor,
            padding: "8px 18px",
            borderRadius: "10px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            display: "inline-flex",
            flexDirection: "column",
          }}
        >
          <span
            style={{
              fontFamily: "Impact, var(--font-display), 'Montserrat', sans-serif",
              fontSize,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              color: textColor,
              textTransform: "uppercase",
              textShadow: "0 3px 8px rgba(0,0,0,0.95)",
              WebkitTextStroke: "1px #000000",
            }}
          >
            {line1}
          </span>
          {line2 && (
            <span
              style={{
                fontFamily: "Impact, var(--font-display), 'Montserrat', sans-serif",
                fontSize,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                textTransform: "uppercase",
                textShadow: "0 3px 8px rgba(0,0,0,0.95)",
                WebkitTextStroke: "1px #000000",
                marginTop: 4,
              }}
            >
              {line2}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getStoryNarrative = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "string") return blueprint.visualStory;
    return blueprint.visualStory?.narrative || null;
  };

  const getFocalSubject = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "object" && blueprint.visualStory?.primaryFocalSubject) {
      return blueprint.visualStory.primaryFocalSubject;
    }
    return blueprint.focalSubject || null;
  };

  const getEnvironment = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "object" && blueprint.visualStory?.backgroundEnvironment) {
      return blueprint.visualStory.backgroundEnvironment;
    }
    return blueprint.backgroundScene || null;
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--accent-primary, #38bdf8)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            YOUTUBE THUMBNAIL DESIGN STUDIO
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
          High-CTR 16:9 Thumbnail Generator
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          AI-designed visual hierarchy, intentional composition, and separate mobile-optimized typography.
        </p>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {blueprintError && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1 }}>{blueprintError}</span>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "4px 10px" }}
            onClick={() => setBlueprintError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Synchronized Title & Script Context Panel */}
      <div
        className="card"
        style={{
          padding: "clamp(16px, 3vw, 22px)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color="var(--accent-primary, #38bdf8)" />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>
              Content Understanding & Strategy Input
            </span>
          </div>
          <button
            onClick={craftSynchronizedThumbnail}
            disabled={anyTaskRunning}
            className="btn"
            style={{
              fontSize: 12.5,
              padding: "6px 14px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
              color: "#fff",
              opacity: anyTaskRunning && !craftingBlueprint ? 0.5 : 1,
            }}
          >
            {craftingBlueprint ? (
              <>
                <Loader2 size={13} className="spin" /> Designing Thumbnail Strategy…
              </>
            ) : (
              <>
                <Sparkles size={13} /> AI Thumbnail Design Strategy
              </>
            )}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={13} color="var(--accent-mint)" /> Video Title / Topic
            </label>
            <input
              className="input"
              style={{ width: "100%", fontSize: 13 }}
              placeholder="e.g. What They Actually Hide Inside Google Headquarters..."
              value={sourceTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={13} color="var(--accent-amber)" /> Script / Hook Excerpt (Optional)
            </label>
            <input
              className="input"
              style={{ width: "100%", fontSize: 13 }}
              placeholder="e.g. We got rare access behind the security turnstiles..."
              value={sourceScript}
              onChange={(e) => setSourceScript(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Blueprint & Structural Strategy Display */}
      {blueprint && (
        <div
          className="card"
          style={{
            padding: "clamp(16px, 3vw, 22px)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            background: "rgba(56, 189, 248, 0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={16} color="var(--accent-mint)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
                Thumbnail Creative Direction
              </span>
              {blueprint.objective?.type && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--accent-amber, #fbbf24)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    fontWeight: 700,
                  }}
                >
                  🎯 {blueprint.objective.type}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "var(--accent-primary, #38bdf8)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                📐 {(blueprint.layout || "Dynamic").replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* 1-Second Promise & Visual Story */}
          {blueprint.objective?.oneSecondPromise && (
            <div style={{ fontSize: 12.5, color: "var(--text-primary)", background: "rgba(56, 189, 248, 0.08)", padding: "8px 12px", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-primary)" }}>
              ⚡ <strong>1-Second Viewer Promise:</strong> "{blueprint.objective.oneSecondPromise}"
            </div>
          )}

          {getStoryNarrative() && (
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", background: "var(--surface-2)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", lineHeight: 1.5 }}>
              📖 <strong>Visual Story:</strong> {getStoryNarrative()}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                🎯 PRIMARY FOCAL SUBJECT
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {getFocalSubject() || "Central hero element"}
              </div>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                🏞️ AUTHENTIC ENVIRONMENT
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {getEnvironment() || "Authentic setting"}
              </div>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                🔤 THUMBNAIL HOOK TEXT
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "var(--accent-amber, #fbbf24)", letterSpacing: "0.04em" }}>
                  "{blueprint.textStrategy?.overlayText || blueprint.overlayText}"
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  ({(blueprint.textStrategy?.overlayText || blueprint.overlayText || "").split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>
            </div>
          </div>

          {/* Real QA Validation Checklist */}
          {blueprint.qa && (
            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", marginTop: 2 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span>🛡️ Thumbnail Quality Assurance (QA)</span>
                <span style={{ color: "var(--accent-mint)", fontWeight: 700 }}>{blueprint.qa.overallVerdict}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 8, fontSize: 11.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: blueprint.qa.focalPointClarity.passed ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <CheckCircle2 size={13} color="var(--accent-mint)" /> Focal Point: {blueprint.qa.focalPointClarity.passed ? "Defined" : "Check"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: blueprint.qa.textBrevity.passed ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <CheckCircle2 size={13} color="var(--accent-mint)" /> Text Brevity: {blueprint.qa.textBrevity.wordCount} words
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: blueprint.qa.mobileReadability.passed ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <CheckCircle2 size={13} color="var(--accent-mint)" /> Mobile Readability: Clear Zone
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: blueprint.qa.accuracyCheck.passed ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <CheckCircle2 size={13} color="var(--accent-mint)" /> Context: Non-Inventive
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Prompt & Controls Card */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
            Engine Prompt (16:9 1280x720)
          </label>
          <span style={{ fontSize: 11.5, color: "var(--accent-primary, #38bdf8)", fontWeight: 600 }}>
            📐 Standard YouTube 16:9 Thumbnail
          </span>
        </div>

        <textarea
          className="input"
          placeholder="Describe your thumbnail visual..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={loading}
          style={{ width: "100%", fontSize: 13.5, lineHeight: 1.45 }}
        />

        {/* Thumbnail Style Presets */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase" }}>
            Select Visual Aesthetic Preset:
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 8,
            }}
          >
            {THUMBNAIL_PRESETS.map((preset) => {
              const active = selectedPreset.name === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPreset(preset)}
                  className="btn"
                  style={{
                    padding: "10px 12px",
                    background: active ? "rgba(56, 189, 248, 0.12)" : "var(--surface-2)",
                    border: `1px solid ${active ? "var(--accent-primary, #38bdf8)" : "var(--border)"}`,
                    color: active ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    gap: 3,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{preset.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.25 }}>
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Separate Text Overlay Layer Controls */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Type size={15} color="var(--accent-primary, #38bdf8)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Separate High-CTR Text Overlay (1–4 Words)
              </span>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={showOverlayBadge}
                onChange={(e) => setShowOverlayBadge(e.target.checked)}
              />
              Show Text Overlay on Thumbnail
            </label>
          </div>

          {showOverlayBadge && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
              <div>
                <input
                  className="input"
                  placeholder="e.g. WHAT'S INSIDE? or BEHIND THIS DOOR"
                  value={overlayText}
                  maxLength={OVERLAY_TEXT_MAX_LEN}
                  onChange={(e) => setOverlayText(e.target.value.toUpperCase())}
                  style={{ width: "100%", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}
                />
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  Kept short (1–4 words) for instant 1-second viewer readability on mobile feeds.
                </span>
              </div>

              <div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {BADGE_POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setBadgePosition(pos.value)}
                      className="btn"
                      style={{
                        padding: "5px 10px",
                        fontSize: 11.5,
                        background: badgePosition === pos.value ? "var(--accent-primary, #38bdf8)" : "var(--surface-2)",
                        color: badgePosition === pos.value ? "#000" : "var(--text-secondary)",
                        fontWeight: badgePosition === pos.value ? 700 : 500,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={generate}
            disabled={anyTaskRunning || !prompt.trim()}
            className="btn btn-primary"
            style={{
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="spin" /> Rendering 16:9 Thumbnail…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Render 16:9 Thumbnail
              </>
            )}
          </button>

          {imageUrl && !loading && (
            <button className="btn btn-ghost" onClick={generate} disabled={anyTaskRunning} style={{ fontSize: 13 }}>
              <RefreshCw size={14} /> New Variation
            </button>
          )}
        </div>
      </div>

      {/* Result Display with Live Text Overlay */}
      {imageUrl && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <SectionHeader eyebrow="Live Preview" title="Generated 16:9 YouTube Thumbnail" />
            <button
              onClick={downloadImage}
              className="btn"
              style={{ padding: "6px 14px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Download size={14} /> Download HD Image
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "#0b0f19",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={imageUrl}
              alt={sourceTitle || prompt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Dynamic Multi-Line High-CTR Text Overlay */}
            {renderDynamicTextOverlay()}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Objective: <strong>{blueprint?.objective?.type || "Curiosity"}</strong> · Layout: <strong>{(blueprint?.layout || "LEFT_TEXT_RIGHT_SUBJECT").replace(/_/g, " ")}</strong> · 1280x720 (16:9)
            </div>
            <CopyButton text={prompt} label="Copy Engine Prompt" />
          </div>
        </div>
      )}
    </div>
  );
}
