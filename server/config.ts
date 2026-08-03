import "dotenv/config";

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
  port: Number(process.env.PORT || 3001),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: "7d",
  corsOrigins: list(process.env.CORS_ORIGIN, ["http://localhost:5173"]),
  apiToken: process.env.API_TOKEN || "",
  dbPath: process.env.DB_PATH || "./data/wavelength.db",
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
  youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  isProduction: process.env.NODE_ENV === "production",
};
