import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Download, Sparkles, RefreshCw, Layers } from "lucide-react";
import { SectionHeader, ErrorBanner, CopyButton } from "../components/SharedUI";
import { useTask } from "../lib/hooks";

const THUMBNAIL_PRESETS = [
  {
    name: "High-CTR YouTube Viral",
    stylePrompt: "viral high CTR YouTube thumbnail style, hyper-detailed, bold dramatic lighting, vibrant colors, expressive 3D graphics, octane render, 8k resolution",
  },
  {
    name: "Dark Tech & Neon",
    stylePrompt: "dark futuristic tech background, glowing neon cyan and purple accents, high contrast, cyberpunk aesthetic, sleek minimal modern, 8k",
  },
  {
    name: "Cinematic 3D",
    stylePrompt: "cinematic film still, volumetric rim lighting, photorealistic 8k, bokeh depth of field, unreal engine 5 render",
  },
  {
    name: "Split Comparison Screen",
    stylePrompt: "split screen comparison layout, side by side contrast, red cross versus green checkmark, high energy thumbnail, bold vibrant",
  },
  {
    name: "Minimalist Authority",
    stylePrompt: "clean studio background, minimalist typography layout, professional tech aesthetic, sharp focus, Apple design language",
  },
];

export default function ImageGeneratorPage() {
  const location = useLocation();
  const initialPrompt = (location.state as { prompt?: string })?.prompt || "";
  
  const { loading, error, clearError, run } = useTask();
  const [prompt, setPrompt] = useState(initialPrompt || "AI coder replacing developer in futuristic cyber office");
  const [selectedPreset, setSelectedPreset] = useState(THUMBNAIL_PRESETS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio] = useState<"16:9" | "1:1">("16:9");

  const generate = () =>
    run(async () => {
      // Build high quality prompt with YouTube thumbnail optimization
      const fullPrompt = `${prompt}, ${selectedPreset.stylePrompt}`;
      const width = aspectRatio === "16:9" ? 1280 : 1024;
      const height = aspectRatio === "16:9" ? 720 : 1024;
      const seed = Math.floor(Math.random() * 999999);

      // Direct high-quality FLUX thumbnail engine
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        fullPrompt
      )}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;

      // Preload image in background
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => {
          // If network blocks pollinations, resolve anyway to show fallback
          resolve();
        };
        img.src = url;
      });

      setImageUrl(url);
    });

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `youtube-thumbnail-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          AI Thumbnail & Image Studio
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Generate 16:9 high-CTR YouTube thumbnails with the FLUX AI engine
        </p>
      </div>

      <ErrorBanner message={error} onRetry={clearError} />

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
            Thumbnail Concept & Prompt
          </label>
          <span style={{ fontSize: 11.5, color: "var(--accent-primary, #38bdf8)", fontWeight: 600 }}>
            📐 Standard YouTube 16:9 (1280x720)
          </span>
        </div>

        <textarea
          className="input"
          placeholder="Describe your thumbnail visual, e.g. 'Shocked programmer looking at 10x faster AI code, glowing blue holographic screen'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={loading}
          style={{ width: "100%", fontSize: 14 }}
        />

        {/* Thumbnail Style Presets */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase" }}>
            Select Thumbnail Style Preset:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THUMBNAIL_PRESETS.map((p) => {
              const isSelected = selectedPreset.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPreset(p)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "var(--accent-primary-dim, rgba(56, 189, 248, 0.15))" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                    color: isSelected ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: isSelected ? 600 : 500,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Layers size={13} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{ padding: "10px 24px", fontSize: 13.5 }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="spin" /> Rendering 16:9 Thumbnail…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generate Thumbnail
              </>
            )}
          </button>

          {imageUrl && !loading && (
            <button
              className="btn btn-ghost"
              onClick={generate}
              style={{ fontSize: 13 }}
            >
              <RefreshCw size={14} /> New Variation
            </button>
          )}
        </div>
      </div>

      {/* Result Display */}
      {imageUrl && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionHeader eyebrow="Result" title="Generated YouTube Thumbnail" />
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
            }}
          >
            <img
              src={imageUrl}
              alt={prompt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Style: <strong>{selectedPreset.name}</strong> · Resolution: 1280x720
            </div>
            <CopyButton text={prompt} />
          </div>
        </div>
      )}
    </div>
  );
}
