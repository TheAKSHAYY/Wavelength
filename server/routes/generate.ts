import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { generateMockData } from "../mockData.js";
import { synthesizeRealYouTubeResponse } from "../services/realDataSynthesizer.js";
import { runTitleIntelligencePipeline } from "../services/titleIntelligence.js";
import { generateDynamicScript } from "../services/scriptIntelligence.js";

const router = Router();

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

// Proxies to OpenAI's /v1/responses or /v1/chat/completions endpoint.
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

  // 1. Try OpenAI if API key is provided
  if (config.openaiApiKey) {
    const body: Record<string, unknown> = {
      model: config.openaiModel || "gpt-4o-mini",
      input: prompt,
    };
    if (systemStr.trim()) {
      body.instructions = systemStr;
    }
    if (useWebSearch) {
      body.tools = [{ type: "web_search_preview" }];
    }

    try {
      const openaiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await openaiRes.json()) as Record<string, unknown> & {
        output_text?: string;
        output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>;
        error?: { message?: string; type?: string; code?: string };
      };

      if (openaiRes.ok) {
        let text = data.output_text;
        if (!text) {
          text = (data.output || [])
            .filter((item) => item.type === "message")
            .flatMap((item) => item.content || [])
            .filter((c) => c.type === "output_text")
            .map((c) => c.text || "")
            .join("\n");
        }
        if (text && text.trim()) {
          return res.json({ text: text.trim() });
        }
      } else {
        console.warn("OpenAI API response not ok:", data.error?.message || openaiRes.status);
      }
    } catch (err) {
      console.warn("OpenAI connection error:", err);
    }
  }

  // 2. Real YouTube Data Synthesis (queries live YouTube API for real video stats, channels, views, CTR patterns)
  if (config.youtubeApiKey) {
    try {
      const realYouTubeData = await synthesizeRealYouTubeResponse(systemStr, prompt);
      if (realYouTubeData) {
        return res.json({ text: realYouTubeData });
      }
    } catch (err) {
      console.error("Real YouTube data synthesis error:", err);
    }
  }

  // 3. Fallback to mock data if no live APIs succeeded
  const mockText = generateMockData(systemStr, prompt);
  return res.json({ text: mockText });
});

export default router;

