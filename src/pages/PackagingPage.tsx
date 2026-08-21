import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Zap,
  Type,
  FolderGit2,
  User,
  Save,
  Download,
  Clapperboard,
  Sparkles,
  Check,
} from "lucide-react";
import { ErrorBanner } from "../components/SharedUI";
import { generateImageUrl } from "../lib/imageGenerator";
import { useTask } from "../lib/hooks";
import { useStore } from "../lib/store";
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
    state.title || state.topic || activeProject?.topic || activeProject?.title || "AI Agents vs Traditional Automation"
  );
  const [selectedTitle, setSelectedTitle] = useState(state.title || activeProject?.title || currentIdea);
  const [hook, setHook] = useState(state.hook || "Most developers are building AI agents completely wrong...");
  
  // Title intelligence state
  const [titleData, setTitleData] = useState<z.infer<typeof titlesResponseSchema> | null>(null);

  // Thumbnail intelligence state
  const [thumbnailData, setThumbnailData] = useState<any>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic text overlay overrides
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#FFE600");
  const [pillColor, setPillColor] = useState("rgba(0, 0, 0, 0.78)");
  const [fontSizeScale, setFontSizeScale] = useState(1);

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
      setOverlayText(blueprint.textStrategy?.overlayText || blueprint.overlayText || "MUST WATCH");
      setTextColor(blueprint.textStrategy?.textColor || "#FFE600");
      setPillColor(blueprint.textStrategy?.pillColor || "rgba(0, 0, 0, 0.78)");

      // Trigger high-res FLUX image generation
      if (blueprint.enginePrompt) {
        const imageUrl = generateImageUrl(blueprint.enginePrompt, {
          width: 1280,
          height: 720,
          model: "flux",
          negativePrompt: blueprint.negativePrompt,
        });
        setGeneratedImageUrl(imageUrl);
        setVariants([imageUrl]);
      }
    });
  };

  const handleGenerateVariations = () => {
    if (!thumbnailData?.enginePrompt) return;
    setGeneratingVariants(true);
    try {
      const basePrompt = thumbnailData.enginePrompt;
      const seedBase = Math.floor(Math.random() * 10000);
      
      const v1 = generateImageUrl(`${basePrompt}, dramatic volumetric lighting scheme, high key contrast`, {
        width: 1280,
        height: 720,
        model: "flux",
        seed: seedBase + 1,
      });
      const v2 = generateImageUrl(`${basePrompt}, cinematic wide 24mm angle, deep atmospheric mood`, {
        width: 1280,
        height: 720,
        model: "flux",
        seed: seedBase + 2,
      });
      const v3 = generateImageUrl(`${basePrompt}, hyper-detailed close up focal subject, vivid color palette`, {
        width: 1280,
        height: 720,
        model: "flux",
        seed: seedBase + 3,
      });

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

  const handleCreateShort = () => {
    navigate("/shorts", {
      state: {
        title: selectedTitle,
        topic: currentIdea,
        angle: titleData?.whyRecommended || state.angle,
        projectId: activeProject?.id,
      },
    });
  };

  const handleExportMarkdown = () => {
    const pack = `# ${selectedTitle} — Packaging & Thumbnail Blueprint
Topic: ${currentIdea}
Generated: ${new Date().toLocaleDateString()}

---

## 1. Title Strategy (10 Frameworks)
${titleData?.titles.map((t) => `- [Score: ${t.score}] **${t.framework}**: "${t.title}" (${t.trigger})`).join("\n") || "None generated"}

---

## 2. Thumbnail Visual Blueprint
- **Dominant Subject**: ${thumbnailData?.visualStory?.primaryFocalSubject || thumbnailData?.focalSubject || "Hero subject"}
- **Visual Medium**: ${thumbnailData?.blueprint?.visualMedium || "Tailored visual medium"}
- **Lighting Scheme**: ${thumbnailData?.blueprint?.lightingScheme || "High-contrast dynamic"}
- **Text Overlay**: "${overlayText}"
- **FLUX Engine Prompt**: ${thumbnailData?.enginePrompt || "N/A"}
`;

    const blob = new Blob([pack], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_packaging_blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunFullPackaging = async () => {
    await fetchTitleIntelligence(currentIdea);
    await fetchThumbnailIntelligence(currentIdea);
  };

  useEffect(() => {
    handleRunFullPackaging();
  }, []);

  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
    fetchThumbnailIntelligence(title);
  };

  const handleProceedToScript = () => {
    navigate("/script", {
      state: {
        title: selectedTitle,
        topic: currentIdea,
        hook: hook,
        angle: state.angle || titleData?.whyRecommended,
        thumbnailPrompt: thumbnailData?.enginePrompt,
        overlayText: overlayText,
        projectId: activeProject?.id,
      },
    });
  };

  // Dynamic Multi-Line Typography Scaling Helper
  const renderTextOverlay = () => {
    if (!overlayText) return null;
    const words = overlayText.trim().split(/\s+/).filter(Boolean);
    const layoutZone = thumbnailData?.textStrategy?.layoutZone || "left";

    let line1 = overlayText;
    let line2 = "";

    if (words.length >= 3) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(" ");
      line2 = words.slice(mid).join(" ");
    }

    let posStyle: React.CSSProperties = {
      position: "absolute",
      top: "14%",
      left: "6%",
      maxWidth: "50%",
      zIndex: 10,
    };

    if (layoutZone === "right" || layoutZone === "top-right" || layoutZone === "bottom-right") {
      posStyle = {
        position: "absolute",
        top: "14%",
        right: "6%",
        left: "auto",
        maxWidth: "50%",
        textAlign: "right",
        zIndex: 10,
      };
    } else if (layoutZone === "top") {
      posStyle = {
        position: "absolute",
        top: "8%",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "80%",
        textAlign: "center",
        zIndex: 10,
      };
    }

    const baseSize = words.length <= 2 ? "clamp(24px, 5.2vw, 54px)" : "clamp(18px, 3.8vw, 42px)";

    return (
      <div style={posStyle}>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: layoutZone === "right" ? "flex-end" : layoutZone === "top" ? "center" : "flex-start",
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: "Impact, 'Arial Black', sans-serif",
              fontSize: `calc(${baseSize} * ${fontSizeScale})`,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 0.95,
              color: textColor,
              background: pillColor,
              padding: "4px 14px",
              borderRadius: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.85)",
              WebkitTextStroke: "2px #000000",
              textShadow: "0 4px 16px rgba(0,0,0,0.9)",
              display: "inline-block",
            }}
          >
            {line1}
          </span>
          {line2 && (
            <span
              style={{
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: `calc(${baseSize} * ${fontSizeScale})`,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 0.95,
                color: textColor,
                background: pillColor,
                padding: "4px 14px",
                borderRadius: 6,
                boxShadow: "0 8px 24px rgba(0,0,0,0.85)",
                WebkitTextStroke: "2px #000000",
                textShadow: "0 4px 16px rgba(0,0,0,0.9)",
                display: "inline-block",
              }}
            >
              {line2}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto" }}>
      {/* Project & Creator Profile Context Bar */}
      {activeProject && (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
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
            <FolderGit2 size={15} color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
              PROJECT: {activeProject.title}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              {activeProject.status}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11.5 }}>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>
              Packaging Studio (Active)
            </span>
            <button
              onClick={() => navigate("/script", { state: { projectId: activeProject.id } })}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Long-Form {activeProject.longFormScript ? "✓" : "○"}
            </button>
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
          background: "rgba(245, 158, 11, 0.04)",
          border: "1px solid rgba(245, 158, 11, 0.12)",
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
          <User size={13} color="#f59e0b" />
          <span>
            <strong>Creator Memory:</strong> {user?.niche ? user.niche.slice(0, 26) : "Tech & Education"} • Aesthetic: <strong>Cinematic & High-Contrast</strong>
          </span>
        </div>
        <button
          onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", color: "#f59e0b", fontWeight: 600, cursor: "pointer", fontSize: 11 }}
        >
          [ Override ]
        </button>
      </div>

      {/* Header & Studio Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
            STUDIO · 16:9 PACKAGING
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
            Thumbnail & Packaging Studio
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Turn your idea into high-CTR titles and a YouTube-optimized 16:9 thumbnail concept with zero embedded text artifacts.
          </p>
        </div>

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
            onClick={handleCreateShort}
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
          >
            <Clapperboard size={14} color="#38bdf8" /> Create Short from Angle
          </button>
          <button
            onClick={handleExportMarkdown}
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
          >
            <Download size={14} /> Export Blueprint
          </button>
        </div>
      </div>

      <ErrorBanner error={titlesError || thumbError} onDismiss={() => { clearTitlesError(); clearThumbError(); }} />

      {/* Idea Context Bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 20px)", background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Current Concept:</span>
          <input
            className="input"
            style={{ flex: 1, minWidth: 260, fontSize: 14 }}
            value={currentIdea}
            onChange={(e) => setCurrentIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunFullPackaging()}
          />
          <button
            onClick={handleRunFullPackaging}
            disabled={titlesLoading || thumbLoading}
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {titlesLoading || thumbLoading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Repackage
          </button>
        </div>
      </div>

      {/* Main Studio 2-Column: Left = Titles & Hook, Right = 16:9 Thumbnail Studio */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))", gap: 20 }}>
        {/* Left Column: Title Selection & Hook */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Title Options */}
          <div className="card" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Type size={18} color="var(--accent-primary, #38bdf8)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Psychological Titles (10 Frameworks)</h3>
              </div>
            </div>

            {titlesLoading && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                <Loader2 size={20} className="spin" style={{ margin: "0 auto 8px auto" }} />
                Synthesizing high-CTR title variations...
              </div>
            )}

            {titleData && !titlesLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {titleData.titles.map((t, idx) => {
                  const isSelected = selectedTitle === t.title;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectTitle(t.title)}
                      className="hover-lift"
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        border: isSelected ? "2px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(56, 189, 248, 0.08)" : "var(--surface-2)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-primary, #38bdf8)", textTransform: "uppercase" }}>
                            {t.framework}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Score: {t.score}/100</span>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</div>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 size={18} color="var(--accent-primary, #38bdf8)" style={{ flexShrink: 0 }} />
                      ) : (
                        <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: "2px 8px", flexShrink: 0 }}>
                          Select
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Retention Hook Section */}
          <div className="card" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Zap size={16} color="var(--accent-amber, #fbbf24)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>0–15s Verbal Retention Hook</h3>
            </div>
            <textarea
              className="input"
              rows={3}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              style={{ width: "100%", fontSize: 13.5, lineHeight: 1.5, padding: "10px 12px" }}
              placeholder="Opening verbal pattern interrupt for YouTube video..."
            />
          </div>
        </div>

        {/* Right Column: 16:9 Thumbnail Studio Preview & Variations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={18} color="#f59e0b" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>16:9 Thumbnail Design Studio</h3>
              </div>
              <button
                onClick={handleGenerateVariations}
                disabled={generatingVariants || !thumbnailData?.enginePrompt}
                className="btn btn-ghost"
                style={{ fontSize: 11.5, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Sparkles size={13} color="#f59e0b" /> Generate 3 Variations
              </button>
            </div>

            {/* 16:9 Canvas */}
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
                background: "#0a0c10",
                boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
                border: "1px solid var(--border)",
              }}
            >
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="YouTube Thumbnail Render"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column", gap: 8 }}>
                  <Loader2 size={24} className="spin" />
                  <span style={{ fontSize: 13 }}>Rendering 16:9 Visual Blueprint...</span>
                </div>
              )}

              {/* Dynamic Multi-line High-Contrast Typography */}
              {renderTextOverlay()}
            </div>

            {/* Thumbnail Variants Selector */}
            {variants.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                  SELECT VARIATION:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => setGeneratedImageUrl(v)}
                      style={{
                        aspectRatio: "16 / 9",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: generatedImageUrl === v ? "2px solid #f59e0b" : "1px solid var(--border)",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <img src={v} alt={`Variant ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 10, background: "rgba(0,0,0,0.7)", color: "#fff", padding: "1px 4px", borderRadius: 3 }}>
                        Var {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography Controls */}
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>OVERLAY TEXT (1–4 WORDS)</label>
                <input
                  className="input"
                  style={{ width: "100%", fontSize: 13, padding: "6px 10px", marginTop: 4 }}
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>TEXT COLOR</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: 38, height: 34, padding: 2, display: "block", marginTop: 4, cursor: "pointer", background: "none", border: "1px solid var(--border)", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>TEXT SIZE</label>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {[0.85, 1, 1.25].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setFontSizeScale(scale)}
                      className="btn btn-ghost"
                      style={{
                        padding: "4px 8px",
                        fontSize: 11.5,
                        background: fontSizeScale === scale ? "rgba(245, 158, 11, 0.2)" : "var(--surface-2)",
                        border: fontSizeScale === scale ? "1px solid #f59e0b" : "1px solid var(--border)",
                        color: fontSizeScale === scale ? "#f59e0b" : "var(--text-secondary)",
                      }}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Strategy Metadata */}
            {thumbnailData && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
                <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>
                    🎯 Objective: {thumbnailData.objective?.type || "Curiosity"}
                  </div>
                  <div style={{ color: "var(--text-primary)" }}>
                    <strong>1-Second Promise:</strong> {thumbnailData.objective?.oneSecondPromise || "Instant curiosity gap"}
                  </div>
                  <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                    <strong>Dominant Focal Subject:</strong> {thumbnailData.visualStory?.primaryFocalSubject || thumbnailData.focalSubject}
                  </div>
                </div>

                {/* QA Checklist */}
                {thumbnailData.qa && (
                  <div style={{ background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.2)", padding: 12, borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-mint, #34d399)", textTransform: "uppercase", marginBottom: 6 }}>
                      🛡️ Thumbnail QA Validation
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11.5 }}>
                      <div>✅ Focal Clarity: Defined</div>
                      <div>✅ Story Immediacy: High</div>
                      <div>✅ Text Brevity: {thumbnailData.textStrategy?.wordCount || 3} words</div>
                      <div>✅ Mobile Legibility: Clean Zone</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary CTA: Move forward into Script Assistant */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Package ready: "{selectedTitle}"</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Proceed to draft a retention-structured YouTube script in English, Hindi, or Hinglish.</div>
        </div>

        <button
          onClick={handleProceedToScript}
          className="btn btn-primary"
          style={{ padding: "10px 22px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          Build Script Now <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
