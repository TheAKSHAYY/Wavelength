import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { generateMockData } from "../mockData.js";
import { synthesizeRealYouTubeResponse } from "../services/realDataSynthesizer.js";

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

  const systemStr = system || "";

  if (config.geminiApiKey) {
    const input = [system, prompt].filter((s): s is string => !!s && !!s.trim()).join("\n\n").trim();

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: input }] }],
            generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      const data = (await resp.json()) as {
        candidates?: GeminiCandidate[];
        error?: { message?: string };
      };

      if (resp.ok) {
        const text = (data.candidates || [])
          .flatMap((c) => c.content?.parts || [])
          .flatMap((p) => (p.text ? [p.text] : []))
          .join("\n")
          .trim();

        if (text) {
          return res.json({ text });
        }
      } else {
        console.warn("Gemini API error:", data.error?.message || resp.status);
      }
    } catch (err) {
      console.warn("Gemini proxy error:", err);
    }
  }

  // Real YouTube Data Synthesis
  if (config.youtubeApiKey) {
    try {
      const realYouTubeData = await synthesizeRealYouTubeResponse(systemStr, prompt);
      if (realYouTubeData) {
        return res.json({ text: realYouTubeData });
      }
    } catch (err) {
      console.error("Real YouTube data synthesis error in gemini route:", err);
    }
  }

  const mockText = generateMockData(systemStr, prompt);
  return res.json({ text: mockText });
});

router.post("/generate-image", async (req, res) => {
  const { prompt, style } = req.body as { prompt?: string; style?: string };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const styleStr = style || "";

  if (!config.geminiApiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set. Using local SVG generator.");
    const mockImage = generateMockImageSvg(prompt, styleStr);
    return res.json({
      image: mockImage,
      text: `Generated a simulated ${styleStr || "custom"} image based on your prompt: "${prompt}"`,
    });
  }

  const fullPrompt = styleStr ? `${styleStr}. ${prompt}` : prompt;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["Image", "Text"], temperature: 1.0 },
        }),
      }
    );

    const data = (await resp.json()) as {
      candidates?: GeminiCandidate[];
      error?: { message?: string };
    };

    if (!resp.ok) {
      console.error("Gemini image-gen error:", data);
      console.warn("Gemini image-gen API request failed. Falling back to local SVG generator.");
      const mockImage = generateMockImageSvg(prompt, styleStr);
      return res.json({
        image: mockImage,
        text: `Generated a simulated ${styleStr || "custom"} image based on your prompt: "${prompt}"`,
      });
    }

    const parts = (data.candidates || []).flatMap((c) => c.content?.parts || []);
    const inline = parts.find((p) => p.inlineData);
    const textPart = parts.find((p) => p.text);

    if (!inline) {
      console.warn("Gemini did not return an image. Falling back to SVG generator.");
      const mockImage = generateMockImageSvg(prompt, styleStr);
      return res.json({
        image: mockImage,
        text: `Generated a simulated ${styleStr || "custom"} image. (No image found in Gemini output)`,
      });
    }

    return res.json({
      image: `data:${inline.inlineData!.mimeType};base64,${inline.inlineData!.data}`,
      text: textPart?.text,
    });
  } catch (err) {
    console.error("Gemini image proxy error:", err);
    console.warn("Falling back to local SVG generator due to connection error.");
    const mockImage = generateMockImageSvg(prompt, styleStr);
    return res.json({
      image: mockImage,
      text: `Generated a simulated ${styleStr || "custom"} image based on your prompt: "${prompt}"`,
    });
  }
});

export default router;
