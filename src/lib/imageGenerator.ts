/**
 * Wavelength High-Fidelity AI Image & Thumbnail Generator Helper
 */

export interface ImageGeneratorOptions {
  width?: number;
  height?: number;
  model?: "flux" | "flux-realism" | "flux-anime" | "flux-3d" | "turbo";
  seed?: number;
  nologo?: boolean;
  negativePrompt?: string;
}

export const THUMBNAIL_PRESETS = [
  {
    name: "High-Contrast Vibrant",
    stylePrompt: "vivid subject separation, punchy saturated color contrast, sharp focal clarity",
    desc: "High-energy visual with stark contrast and vivid subject focus",
  },
  {
    name: "Dark Atmospheric & Bold Contrast",
    stylePrompt: "moody atmospheric lighting, deep contrast shadows, rich textured rim highlights",
    desc: "Moody, high-contrast visual with intense atmospheric depth",
  },
  {
    name: "Split Comparison Versus",
    stylePrompt: "side-by-side vertical split composition with contrasting lighting tones on each side",
    desc: "Head-to-head versus battles, migrations, and direct visual comparisons",
  },
  {
    name: "Documentary Film Still",
    stylePrompt: "cinematic film still, volumetric natural light, realistic depth of field",
    desc: "Documentary & deep-dive cinematic storytelling aesthetic",
  },
  {
    name: "Clean Minimalist Studio",
    stylePrompt: "clean directional lighting, minimalist uncluttered backdrop, soft directional shadows",
    desc: "Clean, elegant, distraction-free focal presentation",
  },
];

/**
 * Generates a direct FLUX AI image URL for YouTube thumbnails and graphics.
 * @param prompt Text prompt describing visual
 * @param options Optional dimensions, model, seed, negativePrompt
 */
export function generateImageUrl(
  prompt: string,
  options: ImageGeneratorOptions = {}
): string {
  const {
    width = 1280, // Default YouTube 16:9 standard
    height = 720,
    model = "flux",
    seed = Math.floor(Math.random() * 1_000_000),
    nologo = true,
    negativePrompt,
  } = options;

  const cleanPrompt = (prompt || "high contrast cinematic visual").trim();
  const encoded = encodeURIComponent(cleanPrompt);

  let url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=${model}&nologo=${nologo}&seed=${seed}`;
  if (negativePrompt && negativePrompt.trim()) {
    url += `&negative=${encodeURIComponent(negativePrompt.trim())}`;
  }

  return url;
}

export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  provider: "imagen" | "flux" | "direct";
}

/**
 * Robust, provider-agnostic image generator with automated multi-tier fallback.
 */
export async function fetchGeneratedImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const width = params.width || 1280;
  const height = params.height || 720;
  const seed = params.seed || Math.floor(Math.random() * 1_000_000);

  // 1. Try server backend route (/api/gemini/generate-image) if available
  try {
    const res = await fetch("/api/gemini/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.image && typeof data.image === "string") {
        return {
          imageUrl: data.image,
          provider: data.provider || (data.image.startsWith("data:") ? "imagen" : "flux"),
        };
      }
    }
  } catch {
    // Gracefully fall back to client-side direct FLUX rendering
  }

  // 2. Direct client-side FLUX generation
  const directUrl = generateImageUrl(params.prompt, {
    width,
    height,
    seed,
    negativePrompt: params.negativePrompt,
  });

  await preloadImage(directUrl);
  return {
    imageUrl: directUrl,
    provider: "direct",
  };
}

/**
 * Preload an image URL into browser cache before displaying
 */
export async function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

/**
 * Downloads an image from a URL as a JPG file
 */
export async function downloadImageUrl(url: string, filename: string): Promise<void> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}
