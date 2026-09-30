import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Download,
  Check,
  Smartphone,
  Monitor,
  Type,
} from "lucide-react";
import { ErrorBanner } from "../components/SharedUI";
import { generateImageUrl, fetchGeneratedImage } from "../lib/imageGenerator";
import { useTask } from "../lib/hooks";
import { useStore } from "../lib/store";
import { initials } from "../lib/format";
import ProjectWorkflowBar from "../components/ProjectWorkflowBar";
import { z } from "zod";

const titlesResponseSchema = z.object({
  recommendedTitle: z.string(),
  whyRecommended: z.string(),
  titles: z.array(
    z.object({
      framework: z.string(),
      title: z.string(),
      score: z.number(),
      trigger: z.string(),
    })
  ).min(3),
});

export default function PackagingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeProject, updateProject, createProject, setCurrentProject } = useStore();
  const state = (location.state || {}) as {
    title?: string;
    topic?: string;
    hook?: string;
    angle?: string;
    projectId?: string;
    keyPoints?: string[];
  };

  const [currentIdea, setCurrentIdea] = useState(
    state.title || state.topic || activeProject?.topic || activeProject?.title || "Why Senior Developers Write Less Code"
  );
  const [selectedTitle, setSelectedTitle] = useState(state.title || activeProject?.title || currentIdea);
  const hook = state.hook || "Most developers are building software completely wrong...";

  // Title intelligence state
  const [titleData, setTitleData] = useState<z.infer<typeof titlesResponseSchema> | null>(null);

  // Thumbnail intelligence state
  const [thumbnailData, setThumbnailData] = useState<any>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportingThumbnail, setExportingThumbnail] = useState(false);

  // Dynamic text overlay overrides
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#FFE600");
  const [pillColor, setPillColor] = useState("rgba(0, 0, 0, 0.85)");
  const [selectedFont, setSelectedFont] = useState<"Anton" | "Bebas Neue" | "Montserrat">("Anton");
  const [showOverlay, setShowOverlay] = useState(true);
  const [aiHookOptions, setAiHookOptions] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const { loading: titlesLoading, error: titlesError, clearError: clearTitlesError, run: runTitles } = useTask();
  const { loading: thumbLoading, error: thumbError, clearError: clearThumbError, run: runThumb } = useTask();

  const fetchTitleIntelligence = async (ideaText: string) => {
    clearTitlesError();
    await runTitles(async () => {
      const res = await fetch("/api/generate/title-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: ideaText }),
      });
      if (!res.ok) {
        throw new Error(`Failed to generate titles: ${res.statusText}`);
      }
      const data = await res.json();
      const recommended = data.titles?.[0]?.title || ideaText;
      setTitleData({
        recommendedTitle: recommended,
        whyRecommended: data.titles?.[0]?.psychologicalTrigger || "Maximum curiosity gap and clickability",
        titles: (data.titles || []).map((t: any) => ({
          framework: t.framework,
          title: t.title,
          score: t.score || 92,
          trigger: t.psychologicalTrigger || t.framework,
        })),
      });
      setSelectedTitle(recommended);
    });
  };

  const fetchThumbnailIntelligence = async (titleText: string) => {
    clearThumbError();
    await runThumb(async () => {
      const res = await fetch("/api/generate/thumbnail-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleText,
          topic: currentIdea,
          hook,
        }),
      });

      if (!res.ok) {
        throw new Error(`Thumbnail intelligence failed: ${res.statusText}`);
      }

      const blueprint = await res.json();
      setThumbnailData(blueprint);
      const defaultText = blueprint.textStrategy?.overlayText || blueprint.overlayText || "MUST WATCH";
      setOverlayText(defaultText);
      setTextColor(blueprint.textStrategy?.textColor || "#FFE600");
      setPillColor(blueprint.textStrategy?.pillColor || "rgba(0, 0, 0, 0.85)");
      setSelectedFont((blueprint.textStrategy?.fontFamily as any) || "Anton");
      setAiHookOptions(blueprint.textStrategy?.suggestedHooks || [defaultText]);

      // Trigger high-res image generation via backend pipeline
      if (blueprint.enginePrompt) {
        setGeneratingVariants(true);
        fetchGeneratedImage({
          prompt: blueprint.enginePrompt,
          negativePrompt: blueprint.negativePrompt,
          width: 1280,
          height: 720,
        })
          .then((res) => {
            if (res.imageUrl) {
              setGeneratedImageUrl(res.imageUrl);
              setVariants([res.imageUrl]);
            }
          })
          .catch((err) => {
            console.warn("Backend image generation fallback to client FLUX:", err);
            const fallback = generateImageUrl(blueprint.enginePrompt, {
              width: 1280,
              height: 720,
              model: "flux",
              negativePrompt: blueprint.negativePrompt,
            });
            setGeneratedImageUrl(fallback);
            setVariants([fallback]);
          })
          .finally(() => {
            setGeneratingVariants(false);
          });
      }
    });
  };

  const handleGenerateVariations = () => {
    if (!thumbnailData?.enginePrompt) return;
    setGeneratingVariants(true);
    try {
      const basePrompt = thumbnailData.enginePrompt;
      const seedBase = Math.floor(Math.random() * 10000);

      const v1 = generateImageUrl(
        `${basePrompt}, extreme macro close-up on the hero subject, intense tight crop, shallow depth of field`,
        { width: 1280, height: 720, model: "flux", seed: seedBase + 11 }
      );
      const v2 = generateImageUrl(
        `${basePrompt}, wide cinematic establishing shot, deep background atmosphere, 24mm wide angle perspective`,
        { width: 1280, height: 720, model: "flux", seed: seedBase + 22 }
      );
      const v3 = generateImageUrl(
        `${basePrompt}, dramatic low-angle hero framing with powerful scale and high visual contrast`,
        { width: 1280, height: 720, model: "flux", seed: seedBase + 33 }
      );

      setVariants([v1, v2, v3]);
    } finally {
      setGeneratingVariants(false);
    }
  };

  const handleSaveToProject = () => {
    const packagingObj = {
      recommendedTitle: titleData?.recommendedTitle,
      whyRecommended: titleData?.whyRecommended,
      selectedTitle,
      titles: titleData?.titles,
      visualBlueprint: thumbnailData ? {
        subject: thumbnailData.visualStory?.primaryFocalSubject || thumbnailData.focalSubject || "",
        visualMedium: thumbnailData.blueprint?.visualMedium || "",
        lightingScheme: thumbnailData.blueprint?.lightingScheme || "",
        cameraFraming: thumbnailData.blueprint?.cameraFraming || "",
        visualStyle: thumbnailData.blueprint?.visualStyle || "",
        environment: thumbnailData.blueprint?.environment || "",
        emotionalTone: thumbnailData.blueprint?.emotionalTone || "",
        composition: thumbnailData.blueprint?.composition || "",
        colorPalette: thumbnailData.colorDirection?.primary || "#FFE600",
        enginePrompt: thumbnailData.enginePrompt || "",
        negativePrompt: thumbnailData.negativePrompt || "",
      } : undefined,
      renderedImageUrl: generatedImageUrl || undefined,
      variants,
      overlayText,
    };

    if (activeProject) {
      updateProject(activeProject.id, {
        packaging: packagingObj,
        title: selectedTitle,
        progressPercent: Math.max(activeProject.progressPercent || 0, 70),
        status: "Packaged",
      });
    } else {
      const proj = createProject({
        title: selectedTitle,
        topic: currentIdea,
        contentType: "Thumbnail",
        packaging: packagingObj,
        progressPercent: 70,
        status: "Packaged",
      });
      setCurrentProject(proj.id);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadBakedThumbnail = async () => {
    if (!generatedImageUrl) return;
    setExportingThumbnail(true);
    try {
      const res = await fetch("/api/export/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImageUrl,
          overlayText: showOverlay ? overlayText : "",
          textColor,
          pillColor,
          fontFamily: selectedFont,
          layoutZone: thumbnailData?.textStrategy?.layoutZone || "left",
        }),
      });

      if (!res.ok) throw new Error("Failed to bake overlay");
      const data = await res.json();
      if (data.imageUrl) {
        const a = document.createElement("a");
        a.href = data.imageUrl;
        a.download = `${selectedTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_thumbnail.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      const a = document.createElement("a");
      a.href = generatedImageUrl;
      a.download = `${selectedTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_thumbnail_raw.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setExportingThumbnail(false);
    }
  };

  const handleNextStep = () => {
    handleSaveToProject();
    if (activeProject?.contentType === "Short") {
      navigate("/shorts", {
        state: {
          projectId: activeProject?.id,
          title: selectedTitle,
          topic: currentIdea,
          hook,
        },
      });
    } else {
      navigate("/script", {
        state: {
          projectId: activeProject?.id,
          title: selectedTitle,
          topic: currentIdea,
          hook,
        },
      });
    }
  };

  // Initial load auto-trigger
  useEffect(() => {
    if (!titleData && !titlesLoading && currentIdea) {
      fetchTitleIntelligence(currentIdea);
    }
  }, [currentIdea]);

  useEffect(() => {
    if (selectedTitle && !thumbnailData && !thumbLoading) {
      fetchThumbnailIntelligence(selectedTitle);
    }
  }, [selectedTitle]);

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 1240,
        margin: "0 auto",
        paddingBottom: 60,
      }}
    >
      {/* ── 1. Top Workflow Bar ────────────────────────────────────── */}
      <ProjectWorkflowBar
        currentPhase="packaging"
        onNextPhase={handleNextStep}
        nextPhaseLabel={activeProject?.contentType === "Short" ? "Next: Shorts Studio →" : "Next: Write Script →"}
      />

      {/* ── 2. Studio Title & Quick Topic Input ────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: "0 0 6px 0" }}>
            Thumbnail & Title Studio
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Pair high-CTR psychological title formulas with synchronized thumbnail visuals and live feed simulation
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              fetchTitleIntelligence(currentIdea);
              if (selectedTitle) fetchThumbnailIntelligence(selectedTitle);
            }}
            disabled={titlesLoading || thumbLoading}
            className="btn btn-secondary"
            style={{ gap: 6, fontSize: 13 }}
          >
            {titlesLoading || thumbLoading ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
            Regenerate All
          </button>

          <button
            onClick={handleSaveToProject}
            className="btn btn-secondary"
            style={{ gap: 6, fontSize: 13 }}
          >
            {savedSuccess ? <Check size={15} color="var(--accent-mint)" /> : null}
            {savedSuccess ? "Saved to Project!" : "Save Blueprint"}
          </button>
        </div>
      </div>

      {titlesError && <ErrorBanner error={titlesError} onDismiss={clearTitlesError} />}
      {thumbError && <ErrorBanner error={thumbError} onDismiss={clearThumbError} />}

      {/* ── 3. Main 2-Column Packaging Studio ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: 24 }}>
        {/* Left Column: 10 High-CTR Title Formulas */}
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            padding: "22px 24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={17} color="var(--accent-amber)" />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Title Formulas & Rationale
              </h2>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {titleData?.titles?.length || 0} Variations
            </span>
          </div>

          {/* Current Idea Input */}
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
              Core Topic
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentIdea.trim()) fetchTitleIntelligence(currentIdea);
                }}
                style={{
                  flex: 1,
                  height: 42,
                  padding: "0 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
              <button
                onClick={() => fetchTitleIntelligence(currentIdea)}
                disabled={titlesLoading}
                className="btn btn-secondary"
                style={{ padding: "0 14px", height: 42 }}
              >
                {titlesLoading ? <Loader2 size={15} className="spin" /> : "Update"}
              </button>
            </div>
          </div>

          {/* Titles List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
            {titlesLoading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 10, color: "var(--text-muted)" }}>
                <Loader2 size={20} className="spin" color="var(--accent)" />
                <span style={{ fontSize: 13 }}>Analyzing psychological title angles...</span>
              </div>
            )}

            {!titlesLoading && titleData?.titles?.map((t, idx) => {
              const isSelected = selectedTitle === t.title;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTitle(t.title);
                    fetchThumbnailIntelligence(t.title);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "rgba(255, 107, 74, 0.1)" : "var(--surface-2)",
                    border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: isSelected ? "var(--accent)" : "var(--text-muted)",
                        background: isSelected ? "rgba(255, 107, 74, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {t.framework}
                    </span>

                    <span style={{ fontSize: 11, fontWeight: 700, color: t.score > 90 ? "var(--accent-mint)" : "var(--text-muted)" }}>
                      CTR: {t.score}%
                    </span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#fff" : "var(--text)", lineHeight: 1.4 }}>
                    "{t.title}"
                  </div>

                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Trigger:</span> {t.trigger}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Thumbnail Canvas & Live Feed Simulator */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Live YouTube Feed Preview Toggle Card */}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={17} color="var(--accent)" />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Live YouTube Feed Simulator
                </h2>
              </div>

              {/* View Toggle */}
              <div style={{ display: "inline-flex", background: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: 3, border: "1px solid var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: previewMode === "desktop" ? "var(--surface-3)" : "transparent",
                    color: previewMode === "desktop" ? "#fff" : "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: previewMode === "mobile" ? "var(--surface-3)" : "transparent",
                    color: previewMode === "mobile" ? "#fff" : "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Smartphone size={13} /> Mobile Feed
                </button>
              </div>
            </div>

            {/* Simulated YouTube Feed Video Item */}
            <div
              className="yt-mockup-container"
              style={{
                padding: previewMode === "mobile" ? "12px 14px" : "18px 20px",
                maxWidth: previewMode === "mobile" ? 380 : "100%",
                margin: "0 auto",
                width: "100%",
              }}
            >
              {/* Thumbnail 16:9 Frame */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%", // 16:9 Aspect Ratio
                  background: "#181818",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Thumbnail preview"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: "#666",
                    }}
                  >
                    {thumbLoading ? (
                      <>
                        <Loader2 size={24} className="spin" color="var(--accent)" />
                        <span style={{ fontSize: 12 }}>Generating high-res visual blueprint...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={28} />
                        <span style={{ fontSize: 12 }}>Thumbnail Image Preview</span>
                      </>
                    )}
                  </div>
                )}

                {/* Baked / Live Overlay Text */}
                {showOverlay && overlayText && (
                  <div
                    style={{
                      position: "absolute",
                      left: "6%",
                      bottom: "12%",
                      transform: "rotate(-2deg)",
                      background: pillColor,
                      padding: "4px 12px",
                      borderRadius: 6,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.8)",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: selectedFont === "Anton" ? "'Anton', Impact, sans-serif" : selectedFont,
                        fontSize: previewMode === "mobile" ? 18 : 26,
                        letterSpacing: "0.04em",
                        color: textColor,
                        textTransform: "uppercase",
                        textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                        lineHeight: 1,
                      }}
                    >
                      {overlayText}
                    </span>
                  </div>
                )}

                {/* Video Duration Badge */}
                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    bottom: 8,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    padding: "2px 5px",
                    borderRadius: 4,
                  }}
                >
                  12:45
                </div>
              </div>

              {/* YouTube Video Info Below Thumbnail */}
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: user?.avatar_color || "var(--accent)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {initials(user?.name || user?.channel_name || "Creator")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: previewMode === "mobile" ? 13.5 : 14.5,
                      fontWeight: 600,
                      color: "#f1f1f1",
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {selectedTitle}
                  </div>

                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                    {user?.channel_name || user?.name || "Wavelength Creator Studio"} • 148K views • 2 days ago
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleGenerateVariations}
                  disabled={generatingVariants || !thumbnailData?.enginePrompt}
                  className="btn btn-secondary"
                  style={{ fontSize: 12.5, gap: 5 }}
                >
                  {generatingVariants ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                  3 Variants
                </button>

                <button
                  onClick={handleDownloadBakedThumbnail}
                  disabled={exportingThumbnail || !generatedImageUrl}
                  className="btn btn-secondary"
                  style={{ fontSize: 12.5, gap: 5 }}
                >
                  {exportingThumbnail ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                  Download Image
                </button>
              </div>

              <button
                onClick={handleNextStep}
                className="btn btn-primary"
                style={{ fontSize: 13, gap: 6, padding: "8px 18px" }}
              >
                <span>Write Script</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Typography & Overlay Controls */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "20px 22px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Type size={16} color="var(--accent-amber)" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  Thumbnail Text Overlay
                </span>
              </div>

              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                />
                Show on thumbnail
              </label>
            </div>

            {showOverlay && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Short punchy text (e.g. MUST WATCH)"
                    style={{
                      flex: 1,
                      height: 40,
                      padding: "0 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />

                  {/* Font picker */}
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value as any)}
                    style={{
                      height: 40,
                      padding: "0 10px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    <option value="Anton">Anton (Bold)</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>

                  {/* Color picker */}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    title="Text Color"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  />
                </div>

                {/* AI Hook Suggestions */}
                {aiHookOptions.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                      Suggestions:
                    </span>
                    {aiHookOptions.map((hk, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setOverlayText(hk)}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 6,
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: overlayText === hk ? "var(--accent)" : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {hk}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
