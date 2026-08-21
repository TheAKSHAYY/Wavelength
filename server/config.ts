import dotenv from "dotenv";
dotenv.config({ override: true });

function list(value: string | undefined, fallback: string[]): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .length
    ? (value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : fallback;
}

export const config = {
  port: Number(process.env.PORT || 4180),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: "7d",
  corsOrigins: list(process.env.CORS_ORIGIN, [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ]),
  apiToken: process.env.API_TOKEN || "",
  dbPath: process.env.DB_PATH || "./data/wavelength.db",
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
  youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  isProduction: process.env.NODE_ENV === "production",
};

