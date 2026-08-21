import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import stateRouter from "./routes/state.js";
import generateRouter from "./routes/generate.js";
import geminiRouter from "./routes/gemini.js";
import youtubeRouter from "./routes/youtube.js";
import chatRouter from "./routes/chat.js";

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    providers: {
      openai: Boolean(config.openaiApiKey),
      gemini: Boolean(config.geminiApiKey),
      groq: Boolean(config.groqApiKey),
      openrouter: Boolean(config.openrouterApiKey),
      youtube: Boolean(config.youtubeApiKey),
    },
    activeModel:
      config.geminiApiKey ? config.geminiModel :
      config.groqApiKey ? config.groqModel :
      config.openrouterApiKey ? config.openrouterModel :
      config.openaiApiKey ? config.openaiModel : "local-synthesizer",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/state", stateRouter);
app.use("/api/generate", generateRouter);
app.use("/api/gemini", geminiRouter);
app.use("/api/youtube", youtubeRouter);
app.use("/api/chat", chatRouter);

if (config.isProduction && config.jwtSecret === "dev-only-secret-change-me") {
  console.warn(
    "WARNING: using the default JWT_SECRET in production. Set JWT_SECRET to a long random string."
  );
}

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Wavelength backend running at http://localhost:${config.port}`);
  const activeProviders = [
    config.geminiApiKey && "Google Gemini",
    config.groqApiKey && "Groq Cloud",
    config.openrouterApiKey && "OpenRouter",
    config.openaiApiKey && "OpenAI",
    config.youtubeApiKey && "YouTube Data API",
  ].filter(Boolean);

  if (activeProviders.length > 0) {
    console.log(`Active API Providers: ${activeProviders.join(", ")}`);
  } else {
    console.log("Running in offline zero-key mode with local research synthesis & Pollinations FLUX engine.");
  }
});

