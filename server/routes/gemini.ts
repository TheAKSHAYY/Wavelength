import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { generateAICompletion } from "../services/aiProvider.js";

const router = Router();

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}

function generateMockImageSvg(prompt: string, style: string = ""): string {
  // Let's create a beautiful gradient SVG based on the prompt/style
  // Pick some vibrant colors based on prompt text to keep it semi-deterministic but varied
  const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 120) % 360;
  const color1 = `hsl(${hue1}, 80%, 30%)`;
  const color2 = `hsl(${hue2}, 70%, 15%)`;
  const styleLabel = style ? style.toUpperCase() : "AI ARTWORK";
  
  // Clean prompt for XML display
  const escapedPrompt = prompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  // Chop prompt into multiple lines if it's long
  const words = escapedPrompt.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).length > 30) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += " " + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  // Generate SVG string
  const svgLines = lines.slice(0, 3).map((line, i) => {
    return `<text x="50%" y="${220 + i * 36}" fill="#f8fafc" font-size="24" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">${line}</text>`;
  }).join("\n");

  const svg = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad)" />
  <!-- Glowing circle decorative graphic -->
  <circle cx="80" cy="80" r="140" fill="#ffffff" opacity="0.05" filter="url(#glow)" />
  <circle cx="500" cy="320" r="180" fill="#ffffff" opacity="0.03" filter="url(#glow)" />
  <!-- Border -->
  <rect x="15" y="15" width="570" height="370" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2" />
  
  <!-- Style Badge -->
  <rect x="230" y="45" width="140" height="28" rx="14" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.2" />
  <text x="50%" y="63" fill="#34d399" font-size="11" font-weight="800" font-family="system-ui, monospace" letter-spacing="2" text-anchor="middle">${styleLabel}</text>
  
  <!-- Prompt text -->
  ${svgLines}
  
  <!-- Decorative AI lines -->
  <line x1="200" y1="310" x2="400" y2="310" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1" />
  <circle cx="300" cy="310" r="4" fill="#34d399" />
  
  <!-- Platform watermark -->
  <text x="50%" y="345" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif" letter-spacing="1" opacity="0.7" text-anchor="middle">Wavelength Image Engine v3.0</text>
</svg>
`.trim();

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

router.use(aiLimiter, requireAuthOrToken);

router.post("/generate", async (req, res) => {
  const { system, prompt, temperature } = req.body as {
    system?: string;
    prompt?: string;
    temperature?: number;
  };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  try {
    const result = await generateAICompletion({
      prompt,
      system: system || "",
      temperature,
    });
    return res.json({ text: result.text, provider: result.provider });
  } catch (err) {
    console.error("AI generation error in gemini route:", err);
    return res.status(500).json({ error: "AI generation failed" });
  }
});

router.post("/generate-image", async (req, res) => {
  const { prompt, style, negativePrompt } = req.body as {
    prompt?: string;
    style?: string;
    negativePrompt?: string;
  };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const styleStr = style || "";
  const fullPrompt = styleStr ? `${styleStr}. ${prompt}` : prompt;
  const negPromptStr = (negativePrompt || "").trim();

  // 1. Try Google Imagen 3 if API Key is configured
  if (config.geminiApiKey) {
    try {
      const imagenResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: fullPrompt }],
            parameters: { sampleCount: 1, aspectRatio: "16:9" },
          }),
        }
      );

      if (imagenResp.ok) {
        const imagenData = (await imagenResp.json()) as {
          predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
        };
        const firstPred = imagenData.predictions?.[0];
        if (firstPred?.bytesBase64Encoded) {
          const mime = firstPred.mimeType || "image/jpeg";
          return res.json({
            image: `data:${mime};base64,${firstPred.bytesBase64Encoded}`,
            provider: "imagen",
            text: `Generated visual for "${prompt}" using Imagen 3.`,
          });
        }
      }
    } catch (imagenErr) {
      console.warn("Imagen 3 generation attempt failed, falling back to FLUX:", imagenErr);
    }
  }

  // 2. High-Fidelity Generative Image Provider (Pollinations FLUX)
  try {
    const seed = Math.floor(Math.random() * 1000000);
    let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      fullPrompt
    )}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;

    if (negPromptStr) {
      pollinationsUrl += `&negative=${encodeURIComponent(negPromptStr)}`;
    }

    const polResp = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(18000) });
    if (polResp.ok) {
      const buffer = await polResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mime = polResp.headers.get("content-type") || "image/jpeg";
      return res.json({
        image: `data:${mime};base64,${base64}`,
        provider: "flux",
        text: `Generated high-resolution AI thumbnail visual for "${prompt}".`,
      });
    }
  } catch (polErr) {
    console.warn("Pollinations AI image generation failed:", polErr);
  }

  // 3. Simulated SVG fallback for development if network is offline
  const mockImage = generateMockImageSvg(prompt, styleStr);
  return res.json({
    image: mockImage,
    provider: "mock",
    text: `Simulated visual placeholder generated for: "${prompt}"`,
  });
});

export default router;
