import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { ErrorBanner, CopyButton } from "../components/SharedUI";
import { useTask } from "../lib/hooks";
import { api } from "../lib/client";
import {
  generateImageUrl,
  preloadImage,
  downloadImageUrl,
  THUMBNAIL_PRESETS,
} from "../lib/imageGenerator";
import {
  Button,
  Input,
  Textarea,
  Card,
  Panel,
  Badge,
  Skeleton,
} from "../components/ui";

type BadgePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center-right";

const BADGE_POSITIONS: { value: BadgePosition; label: string }[] = [
  { value: "top-left",     label: "Top-Left"     },
  { value: "top-right",    label: "Top-Right"    },
  { value: "bottom-left",  label: "Bottom-Left"  },
  { value: "bottom-right", label: "Bottom-Right" },
  { value: "center-right", label: "Center-Right" },
];

interface ThumbnailBlueprint {
  objective?: { type: string; oneSecondPromise: string; emotionalTrigger: string };
  visualStory?:
    | {
        narrative: string;
        primaryFocalSubject: string;
        secondaryElements: string[];
        backgroundEnvironment: string;
        subjectPosition: "left" | "right" | "center" | "bottom" | "split";
      }
    | string;
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
    focalPointClarity:    { passed: boolean; note: string };
    relevance:            { passed: boolean; note: string };
    storyImmediacy:       { passed: boolean; note: string };
    textBrevity:          { passed: boolean; wordCount: number; note: string };
    mobileReadability:    { passed: boolean; note: string };
    compositionBalance:   { passed: boolean; layout: string; note: string };
    accuracyCheck:        { passed: boolean; note: string };
    overallVerdict: string;
  };
  colorDirection?: { primary: string; secondary: string; accent: string; contrastRating: string };
  colorPalette?:   { primary: string; secondary: string; accent: string; contrastRating: string };
  enginePrompt: string;
  negativePrompt?: string;
  overlayText?: string;
  badgePosition?: BadgePosition;
  focalSubject?: string;
  backgroundScene?: string;
  composition?: { rule: string; layoutType: string; emotion: string };
  ctrOptimizationTips?: string[];
}

const OVERLAY_TEXT_MAX_LEN = 30;

function slugify(text: string, fallback: string) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  return cleaned || fallback;
}

export default function ImageGeneratorPage() {
  const location = useLocation();
  const state = (location.state || {}) as {
    prompt?: string; title?: string; topic?: string;
    script?: string; angle?: string; audience?: string;
  };

  const initialTopic = state.title || state.topic || "What They Actually Hide Inside Google Headquarters...";
  const [sourceTitle,  setSourceTitle]  = useState(state.title  || state.topic || "");
  const [sourceTopic,  setSourceTopic]  = useState(state.topic  || state.title || "");
  const [sourceScript, setSourceScript] = useState(state.script || "");
  const [prompt, setPrompt] = useState(
    state.prompt ||
      `16:9 YouTube thumbnail photography for "${initialTopic}". High-impact focal hero subject, dramatic lighting, clean negative space, 8k resolution.`,
  );

  const [selectedPreset,    setSelectedPreset]    = useState(THUMBNAIL_PRESETS[0]);
  const [blueprint,         setBlueprint]         = useState<ThumbnailBlueprint | null>(null);
  const [craftingBlueprint, setCraftingBlueprint] = useState(false);
  const [blueprintError,    setBlueprintError]    = useState<string | null>(null);
  const [overlayText,       setOverlayText]       = useState("");
  const [showOverlayBadge,  setShowOverlayBadge]  = useState(true);
  const [badgePosition,     setBadgePosition]     = useState<BadgePosition>("top-left");
  const [imageUrl,          setImageUrl]          = useState<string | null>(null);
  const { loading, error, run, clearError } = useTask();

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
        setOverlayText(
          (res.textStrategy?.overlayText || res.overlayText || "").slice(0, OVERLAY_TEXT_MAX_LEN),
        );
      }
      if (res.badgePosition) setBadgePosition(res.badgePosition);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Couldn't generate the thumbnail blueprint. Try again.";
      setBlueprintError(message);
    } finally {
      setCraftingBlueprint(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setSourceTitle(newTitle);
    setSourceTopic(newTitle);
    clearError();
    setImageUrl(null);
    setBlueprint(null);
  };

  useEffect(() => {
    if (state.title || state.topic || state.script) craftSynchronizedThumbnail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title, state.topic, state.script]);

  const generate = () =>
    run(async () => {
      const url = generateImageUrl(prompt.trim(), {
        width: 1280, height: 720, model: "flux", negativePrompt: blueprint?.negativePrompt,
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

  /* ── Text Overlay Renderer ── */
  const renderDynamicTextOverlay = () => {
    if (!showOverlayBadge || !overlayText.trim()) return null;
    const words = overlayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let line1 = "", line2 = "";
    if (wordCount <= 2)      { line1 = overlayText.trim(); }
    else if (wordCount === 3){ line1 = words.slice(0, 2).join(" "); line2 = words[2]; }
    else { const mid = Math.ceil(wordCount / 2); line1 = words.slice(0, mid).join(" "); line2 = words.slice(mid).join(" "); }

    const layout = blueprint?.layout || (badgePosition === "top-right" ? "RIGHT_TEXT_LEFT_SUBJECT" : "LEFT_TEXT_RIGHT_SUBJECT");
    let containerStyle: React.CSSProperties = {
      position: "absolute", display: "flex", flexDirection: "column", gap: 4,
      pointerEvents: "none", userSelect: "none", zIndex: 10, maxWidth: "52%",
    };
    switch (layout) {
      case "LEFT_TEXT_RIGHT_SUBJECT":
        containerStyle = { ...containerStyle, top: "20%", left: "5%", alignItems: "flex-start", textAlign: "left" }; break;
      case "RIGHT_TEXT_LEFT_SUBJECT":
        containerStyle = { ...containerStyle, top: "20%", right: "5%", alignItems: "flex-end", textAlign: "right" }; break;
      case "TOP_TEXT_BOTTOM_SUBJECT":
        containerStyle = { ...containerStyle, top: "8%", left: "50%", transform: "translateX(-50%)", alignItems: "center", textAlign: "center", maxWidth: "80%" }; break;
      case "SPLIT_COMPARISON":
      case "CENTER_SUBJECT":
        containerStyle = { ...containerStyle, top: "10%", left: "50%", transform: "translateX(-50%)", alignItems: "center", textAlign: "center", maxWidth: "75%" }; break;
      default:
        if (badgePosition === "top-right")         containerStyle = { ...containerStyle, top: "8%",    right: "5%",  alignItems: "flex-end",  textAlign: "right" };
        else if (badgePosition === "bottom-left")   containerStyle = { ...containerStyle, bottom: "8%", left: "5%",   alignItems: "flex-start", textAlign: "left"  };
        else if (badgePosition === "bottom-right")  containerStyle = { ...containerStyle, bottom: "8%", right: "5%",  alignItems: "flex-end",  textAlign: "right" };
        else                                        containerStyle = { ...containerStyle, top: "8%",    left: "5%",   alignItems: "flex-start", textAlign: "left"  };
    }
    const textColor  = blueprint?.textStrategy?.textColor  || "#FFE600";
    const pillColor  = blueprint?.textStrategy?.pillColor  || "rgba(0,0,0,0.82)";
    const fontSize   = wordCount <= 2 ? "clamp(26px,5.2vw,56px)" : "clamp(18px,3.8vw,42px)";
    const textStyle: React.CSSProperties = {
      fontFamily: "'Anton', 'Bebas Neue', 'Montserrat', Impact, sans-serif",
      fontSize, fontWeight: 900, lineHeight: 0.92,
      letterSpacing: "0.03em", textTransform: "uppercase",
      textShadow: "0 2px 10px rgba(0,0,0,0.9)",
      WebkitTextStroke: "3px #000000",
      paintOrder: "stroke fill",
      filter: "drop-shadow(0 4px 0 #000000) drop-shadow(0 8px 18px rgba(0,0,0,0.95))",
    };
    return (
      <div style={{ ...containerStyle, transform: "rotate(-2deg)" }}>
        <div style={{ background: pillColor, padding: "8px 18px", borderRadius: 10,
          boxShadow: "0 16px 36px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)", display: "inline-flex", flexDirection: "column" }}>
          <span style={{ ...textStyle, color: line2 ? "#FFFFFF" : textColor }}>{line1}</span>
          {line2 && <span style={{ ...textStyle, color: textColor, marginTop: 4 }}>{line2}</span>}
        </div>
      </div>
    );
  };

  const getStoryNarrative = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "string") return blueprint.visualStory;
    return (blueprint.visualStory as { narrative?: string })?.narrative || null;
  };
  const getFocalSubject = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "object" && blueprint.visualStory) {
      const vs = blueprint.visualStory as { primaryFocalSubject?: string };
      if (vs.primaryFocalSubject) return vs.primaryFocalSubject;
    }
    return blueprint.focalSubject || null;
  };
  const getEnvironment = () => {
    if (!blueprint) return null;
    if (typeof blueprint.visualStory === "object" && blueprint.visualStory) {
      const vs = blueprint.visualStory as { backgroundEnvironment?: string };
      if (vs.backgroundEnvironment) return vs.backgroundEnvironment;
    }
    return blueprint.backgroundScene || null;
  };

  /* ── Composition Layout Options (visual tile picker) ── */
  const LAYOUT_OPTIONS = [
    { value: "LEFT_TEXT_RIGHT_SUBJECT",          label: "Left Text",   emoji: "◧", desc: "Text left, subject right" },
    { value: "RIGHT_TEXT_LEFT_SUBJECT",          label: "Right Text",  emoji: "◨", desc: "Text right, subject left" },
    { value: "TOP_TEXT_BOTTOM_SUBJECT",          label: "Top Text",    emoji: "⬆", desc: "Text top, subject bottom" },
    { value: "CENTER_SUBJECT",                   label: "Centered",    emoji: "⊡", desc: "Subject centered" },
    { value: "SPLIT_COMPARISON",                 label: "Split",       emoji: "⧺", desc: "Before/after or comparison" },
    { value: "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE", label: "Full Bleed", emoji: "▣", desc: "Full-bleed with negative space" },
  ];
  const [activeLayout, setActiveLayout] = useState<string>(LAYOUT_OPTIONS[0].value);

  /* ═══════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div className="page-enter flex flex-col gap-token-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <div className="text-token-xs font-bold font-mono text-token-accent-blue uppercase tracking-widest mb-token-1">
          YOUTUBE THUMBNAIL DESIGN STUDIO
        </div>
        <h1 className="font-display text-token-2xl font-bold m-0 text-token-text">
          High-CTR 16:9 Thumbnail Generator
        </h1>
        <p className="text-token-sm text-token-text-secondary mt-token-1">
          AI-designed visual hierarchy, intentional composition, and mobile-optimized typography.
        </p>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {blueprintError && (
        <Card className="flex items-center gap-token-3 border-[var(--accent-red)] bg-[var(--accent-red-dim)]">
          <AlertTriangle size={16} color="var(--accent-red)" className="shrink-0" />
          <span className="text-token-sm text-token-text-secondary flex-1">{blueprintError}</span>
          <Button variant="ghost" size="sm" onClick={() => setBlueprintError(null)}>Dismiss</Button>
        </Card>
      )}

      {/* ── Split Layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-token-6 items-start">

        {/* ── LEFT: Controls Panel (35%) ─────────────────────────────────── */}
        <div className="flex flex-col gap-token-4 w-full lg:w-[400px] shrink-0">

          {/* Content Context */}
          <Panel
            title="Content Understanding & Strategy"
            action={
              <Button
                variant="primary"
                size="sm"
                loading={craftingBlueprint}
                onClick={craftSynchronizedThumbnail}
                disabled={anyTaskRunning}
              >
                <Sparkles size={13} />
                {craftingBlueprint ? "Designing…" : "AI Strategy"}
              </Button>
            }
          >
            <div className="flex flex-col gap-token-3">
              <Input
                label="Video Title / Topic"
                placeholder="e.g. What They Actually Hide Inside Google Headquarters..."
                value={sourceTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <Input
                label="Script / Hook Excerpt (Optional)"
                placeholder="e.g. We got rare access behind the security turnstiles..."
                value={sourceScript}
                onChange={(e) => setSourceScript(e.target.value)}
              />
            </div>
          </Panel>

          {/* Composition Layout Picker */}
          <Panel title="Composition Layout">
            <div className="grid grid-cols-3 gap-token-2">
              {LAYOUT_OPTIONS.map((opt) => {
                const isActive = activeLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setActiveLayout(opt.value)}
                    className={[
                      "flex flex-col items-center gap-token-1 p-token-2 rounded-token-md border text-center",
                      "transition-all duration-150 cursor-pointer outline-none",
                      isActive
                        ? "border-token-accent bg-[var(--accent-primary-dim)] text-token-accent"
                        : "border-token-border bg-token-surface-2 text-token-text-muted hover:border-token-border-light",
                    ].join(" ")}
                  >
                    <span className="text-token-xl leading-none">{opt.emoji}</span>
                    <span className="text-token-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-token-text-muted leading-tight hidden sm:block">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Visual Style Presets */}
          <Panel title="Visual Aesthetic Preset">
            <div className="flex flex-col gap-token-2">
              {THUMBNAIL_PRESETS.map((preset) => {
                const active = selectedPreset.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(preset)}
                    className={[
                      "flex flex-col items-start text-left px-token-3 py-token-2 rounded-token-md border transition-all duration-150",
                      active
                        ? "border-token-accent bg-[var(--accent-primary-dim)]"
                        : "border-token-border bg-token-surface-2 hover:border-token-border-light",
                    ].join(" ")}
                  >
                    <span className={`text-token-sm font-bold ${active ? "text-token-accent" : "text-token-text"}`}>
                      {preset.name}
                    </span>
                    <span className="text-token-xs text-token-text-muted leading-snug">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Engine Prompt */}
          <Panel title="Engine Prompt (16:9 · 1280×720)">
            <Textarea
              placeholder="Describe your thumbnail visual..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </Panel>

          {/* Text Overlay Controls */}
          <Panel
            title="High-CTR Text Overlay"
            action={
              <label className="flex items-center gap-token-2 cursor-pointer text-token-xs text-token-text-secondary">
                <input
                  type="checkbox"
                  checked={showOverlayBadge}
                  onChange={(e) => setShowOverlayBadge(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                Show overlay
              </label>
            }
          >
            {showOverlayBadge && (
              <div className="flex flex-col gap-token-3">
                <Input
                  label="Overlay Text (1–4 words)"
                  placeholder="e.g. WHAT'S INSIDE?"
                  value={overlayText}
                  maxLength={OVERLAY_TEXT_MAX_LEN}
                  onChange={(e) => setOverlayText(e.target.value.toUpperCase())}
                  hint="Keep short for instant mobile readability"
                />
                <div>
                  <span className="block text-token-xs font-semibold text-token-text-secondary uppercase tracking-wide mb-token-2">
                    Text Position
                  </span>
                  <div className="flex gap-token-2 flex-wrap">
                    {BADGE_POSITIONS.map((pos) => {
                      const active = badgePosition === pos.value;
                      return (
                        <button
                          key={pos.value}
                          onClick={() => setBadgePosition(pos.value)}
                          className={[
                            "px-token-2 py-[4px] rounded-token-sm text-token-xs font-semibold border transition-all duration-150",
                            active
                              ? "bg-token-accent text-white border-transparent"
                              : "bg-token-surface-2 text-token-text-secondary border-token-border hover:border-token-border-light",
                          ].join(" ")}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          {/* Generate CTA */}
          <div className="flex gap-token-2 items-center">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={generate}
              loading={loading}
              disabled={anyTaskRunning || !prompt.trim()}
            >
              <Sparkles size={15} />
              {loading ? "Rendering…" : "Render 16:9 Thumbnail"}
            </Button>
            {imageUrl && !loading && (
              <Button variant="secondary" size="md" onClick={generate} disabled={anyTaskRunning}>
                <RefreshCw size={14} /> Variation
              </Button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sticky Canvas Preview (65%) ─────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-token-4 lg:sticky lg:top-[72px] self-start">

          {/* Canvas */}
          <Card noPad className="overflow-hidden">
            <div
              className="relative w-full"
              style={{ aspectRatio: "16 / 9", background: "#0b0f19" }}
            >
              {loading ? (
                /* Skeleton overlay while rendering */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-token-3">
                  <Skeleton width="w-full" height="h-full" rounded="lg" className="absolute inset-0" />
                  <div className="relative z-10 flex flex-col items-center gap-token-2">
                    <ImageIcon size={32} className="text-token-text-muted opacity-30" />
                    <span className="text-token-sm text-token-text-muted">Rendering thumbnail…</span>
                  </div>
                </div>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={sourceTitle || prompt}
                    className="w-full h-full object-cover"
                  />
                  {renderDynamicTextOverlay()}
                </>
              ) : (
                /* Empty state before first render */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-token-3">
                  <ImageIcon size={40} className="opacity-20 text-token-text-muted" />
                  <span className="text-token-sm text-token-text-muted">
                    {craftingBlueprint ? "Crafting AI strategy…" : "Your 16:9 thumbnail will appear here"}
                  </span>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="flex justify-between items-center px-token-4 py-token-3 border-t border-token-border">
                <span className="text-token-xs text-token-text-secondary">
                  {blueprint?.objective?.type && (
                    <><strong>{blueprint.objective.type}</strong> · </>
                  )}
                  {(blueprint?.layout || "LEFT_TEXT_RIGHT_SUBJECT").replace(/_/g, " ")} · 1280×720
                </span>
                <div className="flex gap-token-2">
                  <CopyButton text={prompt} label="Copy Prompt" />
                  <Button variant="secondary" size="sm" onClick={downloadImage}>
                    <Download size={13} /> Download HD
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Blueprint / Creative Direction */}
          {craftingBlueprint && !blueprint && (
            <Card className="flex flex-col gap-token-3">
              <div className="flex items-center gap-token-2">
                <Skeleton width="w-4" height="h-4" rounded="sm" />
                <Skeleton width="w-48" height="h-3" />
              </div>
              <Skeleton width="w-full" height="h-3" />
              <Skeleton width="w-3/4" height="h-3" />
              <div className="grid grid-cols-3 gap-token-2 mt-token-2">
                {[1,2,3].map(i => <Skeleton key={i} height="h-14" />)}
              </div>
            </Card>
          )}

          {blueprint && (
            <Card className="flex flex-col gap-token-4 border-[rgba(56,189,248,0.3)] bg-[rgba(56,189,248,0.03)]">
              {/* Header */}
              <div className="flex justify-between items-center flex-wrap gap-token-2">
                <div className="flex items-center gap-token-2">
                  <ShieldCheck size={16} color="var(--accent-mint)" />
                  <span className="text-token-sm font-bold text-token-text">Thumbnail Creative Direction</span>
                  {blueprint.objective?.type && (
                    <Badge variant="warning">{blueprint.objective.type}</Badge>
                  )}
                </div>
                {blueprint.layout && (
                  <Badge variant="accent">{blueprint.layout.replace(/_/g, " ")}</Badge>
                )}
              </div>

              {/* 1-Second Promise */}
              {blueprint.objective?.oneSecondPromise && (
                <div className="text-token-sm text-token-text bg-[rgba(56,189,248,0.08)] p-token-3 rounded-token-sm border-l-2 border-[var(--accent-blue)]">
                  <strong>1-Second Viewer Promise:</strong> "{blueprint.objective.oneSecondPromise}"
                </div>
              )}

              {/* Visual Story */}
              {getStoryNarrative() && (
                <div className="text-token-sm text-token-text-secondary bg-token-surface-2 p-token-3 rounded-token-md border border-token-border leading-relaxed">
                  <strong>Visual Story:</strong> {getStoryNarrative()}
                </div>
              )}

              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-token-2">
                {[
                  { label: "FOCAL SUBJECT",  value: getFocalSubject() || "Central hero" },
                  { label: "ENVIRONMENT",    value: getEnvironment()  || "Authentic setting" },
                  { label: "HOOK TEXT",       value: blueprint.textStrategy?.overlayText || blueprint.overlayText || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-token-surface-2 p-token-3 rounded-token-md border border-token-border">
                    <div className="text-token-xs font-bold text-token-text-muted uppercase tracking-wide mb-token-1">{label}</div>
                    <div className="text-token-sm text-token-text-secondary leading-snug">{value}</div>
                  </div>
                ))}
              </div>

              {/* QA Checklist */}
              {blueprint.qa && (
                <div className="bg-token-surface-2 p-token-3 rounded-token-md border border-token-border">
                  <div className="flex justify-between items-center mb-token-2">
                    <span className="text-token-xs font-bold text-token-text-muted uppercase tracking-wide">QA Checklist</span>
                    <Badge variant="success">{blueprint.qa.overallVerdict}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-token-2">
                    {[
                      { label: "Focal Point",      passed: blueprint.qa.focalPointClarity.passed,  extra: "" },
                      { label: "Text Brevity",     passed: blueprint.qa.textBrevity.passed,         extra: `${blueprint.qa.textBrevity.wordCount}w` },
                      { label: "Mobile Ready",     passed: blueprint.qa.mobileReadability.passed,   extra: "" },
                      { label: "Non-Inventive",    passed: blueprint.qa.accuracyCheck.passed,       extra: "" },
                    ].map(({ label, passed, extra }) => (
                      <div key={label} className="flex items-center gap-token-1 text-token-xs">
                        <CheckCircle2 size={12} color={passed ? "var(--accent-mint)" : "var(--text-muted)"} />
                        <span className={passed ? "text-token-text" : "text-token-text-muted"}>
                          {label}{extra ? ` · ${extra}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
