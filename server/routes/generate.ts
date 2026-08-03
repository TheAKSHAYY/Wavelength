import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";

const router = Router();

// Proxies to OpenAI's /v1/responses endpoint. The API key lives only on the
// server and is never sent to the browser.
router.post("/", aiLimiter, requireAuthOrToken, async (req, res) => {
  if (!config.openaiApiKey) {
    return res.status(500).json({
      error:
        "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.",
    });
  }

  const { system, prompt, useWebSearch } = (req.body || {}) as {
    system?: unknown;
    prompt?: unknown;
    useWebSearch?: unknown;
  };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const body: Record<string, unknown> = {
    model: config.openaiModel,
    input: prompt,
  };
  if (typeof system === "string" && system.trim()) {
    body.instructions = system;
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
      error?: { message?: string };
    };

    if (!openaiRes.ok) {
      console.error("OpenAI API error:", data);
      return res.status(openaiRes.status).json({
        error: data?.error?.message || "OpenAI API request failed.",
      });
    }

    let text = data.output_text;
    if (!text) {
      text = (data.output || [])
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content || [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text || "")
        .join("\n");
    }

    return res.json({ text: text || "" });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Failed to reach OpenAI API." });
  }
});

export default router;
