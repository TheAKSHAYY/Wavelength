import { Router } from "express";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { generateAICompletion } from "../services/aiProvider.js";
import { runTitleIntelligencePipeline } from "../services/titleIntelligence.js";
import { generateDynamicScript } from "../services/scriptIntelligence.js";
import { runThumbnailIntelligence } from "../services/thumbnailIntelligence.js";
import { generateShortsBlueprint } from "../services/shortsIntelligence.js";

const router = Router();

// Dedicated Creator-First Shorts Studio Pipeline
router.post("/shorts-blueprint", aiLimiter, requireAuthOrToken, async (req, res) => {
  const { topic, creatorMode, duration, language, tone, targetAudience, researchMode, ctaPreference, platform } = req.body || {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "Missing 'topic' in request body." });
  }

  try {
    const blueprint = await generateShortsBlueprint({
      topic: topic.trim(),
      creatorMode,
      duration,
      language,
      tone,
      targetAudience,
      researchMode,
      ctaPreference,
      platform,
    });
    return res.json(blueprint);
  } catch (err) {
    console.error("Shorts blueprint generation error:", err);
    return res.status(500).json({ error: "Failed to generate Shorts blueprint." });
  }
});

// Dedicated Research-Backed Thumbnail Intelligence Pipeline
router.post("/thumbnail-intelligence", aiLimiter, requireAuthOrToken, async (req, res) => {
  const { title, script, topic, stylePreset, angle, audience } = req.body || {};
  try {
    const result = await runThumbnailIntelligence({
      title,
      script,
      topic,
      stylePreset,
      angle,
      audience,
    });
    return res.json(result);
  } catch (err) {
    console.error("Thumbnail intelligence error:", err);
    return res.status(500).json({ error: "Failed to generate thumbnail intelligence." });
  }
});

// Dedicated Research-Backed Title Intelligence Pipeline
router.post("/title-intelligence", aiLimiter, requireAuthOrToken, async (req, res) => {
  const { topic } = req.body || {};
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "Missing 'topic' in request body." });
  }

  try {
    const result = await runTitleIntelligencePipeline(topic.trim());
    return res.json(result);
  } catch (err) {
    console.error("Title intelligence error:", err);
    return res.status(500).json({ error: "Failed to generate title intelligence." });
  }
});

// Dedicated Clean Creator-Grade Script Generation Pipeline
router.post("/script", aiLimiter, requireAuthOrToken, async (req, res) => {
  const { topic, title, audience, angle, language, duration, mode } = (req.body || {}) as {
    topic?: string;
    title?: string;
    audience?: string;
    angle?: string;
    language?: "English" | "Hindi" | "Hinglish";
    duration?: "5-8 minutes" | "8-12 minutes" | "12-15 minutes";
    mode?: "outline" | "full";
  };

  if ((!topic || !topic.trim()) && (!title || !title.trim())) {
    return res.status(400).json({ error: "Missing topic or title in request body." });
  }

  try {
    const script = await generateDynamicScript({
      topic: topic || title || "",
      title: title || topic || "",
      audience,
      angle,
      language,
      duration,
      mode,
    });
    return res.json(script);
  } catch (err) {
    console.error("Script generation error:", err);
    return res.status(500).json({ error: "Failed to generate script." });
  }
});

// Multi-provider AI generation endpoint (Gemini / Groq / OpenRouter / OpenAI / Ollama / Fallback)
router.post("/", aiLimiter, requireAuthOrToken, async (req, res) => {
  const { system, prompt, useWebSearch } = (req.body || {}) as {
    system?: unknown;
    prompt?: unknown;
    useWebSearch?: unknown;
  };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const systemStr = typeof system === "string" ? system : "";

  try {
    const result = await generateAICompletion({
      prompt,
      system: systemStr,
      useWebSearch: Boolean(useWebSearch),
    });
    return res.json({ text: result.text, provider: result.provider });
  } catch (err) {
    console.error("AI generation endpoint error:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
});

export default router;


