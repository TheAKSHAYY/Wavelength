import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// Restrict which origins may call the proxy (browser-enforced). Defaults to
// the Vite dev origin; comma-separate multiple in production.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
  })
);
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.OPENAI_API_KEY;
const API_TOKEN = process.env.API_TOKEN;
// gpt-4o-mini is cheap and fast; bump to gpt-4o in .env if you want higher quality.
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Cap how often one client can hit the paid proxy per minute, so an open
// (or misconfigured) deployment can't be drained for credits.
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// If API_TOKEN is set, /api/claude requires it via x-api-key or Bearer auth.
function requireToken(req, res, next) {
  if (!API_TOKEN) return next();
  const supplied =
    req.get("x-api-key") ||
    (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!supplied || supplied !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid API token." });
  }
  next();
}

// ---------------------------------------------------------------------------
// POST /api/claude  -> proxies to OpenAI's /v1/responses endpoint
// (kept the route name "/api/claude" so the frontend doesn't need changes)
// Keeps the API key on the server, never sent to the browser.
// ---------------------------------------------------------------------------
app.post("/api/claude", apiLimiter, requireToken, async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error:
        "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.",
    });
  }

  const { system, prompt, useWebSearch } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const body = {
    model: MODEL,
    input: prompt,
  };
  // "instructions" is the system-prompt equivalent on the Responses API.
  if (system) body.instructions = system;
  if (useWebSearch) {
    body.tools = [{ type: "web_search_preview" }];
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI API error:", data);
      return res.status(openaiRes.status).json({
        error: data?.error?.message || "OpenAI API request failed.",
      });
    }

    // Responses API gives a convenience field, but fall back to walking
    // the output array in case a given model/tool combo omits it.
    let text = data.output_text;
    if (!text) {
      text = (data.output || [])
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content || [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text)
        .join("\n");
    }

    return res.json({ text: text || "" });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Failed to reach OpenAI API." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(API_KEY), model: MODEL });
});

app.listen(PORT, () => {
  console.log(`Wavelength backend running at http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn(
      "WARNING: OPENAI_API_KEY is not set. Copy .env.example to .env and add your key."
    );
  }
});
