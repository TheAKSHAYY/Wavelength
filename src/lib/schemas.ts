import { z } from "zod";

function normalizeLevel(val: unknown, fallback: "Low" | "Medium" | "High" = "Medium"): "Low" | "Medium" | "High" {
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (lower === "low" || lower === "easy" || lower === "beginner") return "Low";
    if (lower === "high" || lower === "hard" || lower === "advanced" || lower === "very high" || lower === "viral") return "High";
    if (lower === "medium" || lower === "moderate" || lower === "intermediate" || lower === "avg") return "Medium";
  }
  if (typeof val === "number") {
    if (val < 40) return "Low";
    if (val > 70) return "High";
    return "Medium";
  }
  return fallback;
}

function normalizeNumber(val: unknown, fallback: number = 80): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "").trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num;
  }
  return fallback;
}

const competition = z.preprocess((v) => normalizeLevel(v, "Medium"), z.enum(["Low", "Medium", "High"]));
const demand = z.preprocess((v) => normalizeLevel(v, "High"), z.enum(["Low", "Medium", "High"]));
const difficulty = z.preprocess((v) => normalizeLevel(v, "Medium"), z.enum(["Low", "Medium", "High"]));

export const trendSchema = z.object({
  topic: z.preprocess((v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : ""), z.string().min(1)),
  source: z.preprocess((v) => {
    if (typeof v === "string") {
      const lower = v.toLowerCase();
      if (lower.includes("github")) return "GitHub Trending";
      if (lower.includes("reddit")) return "Reddit";
      if (lower.includes("hacker") || lower.includes("hn")) return "Hacker News";
      if (lower.includes("product")) return "Product Hunt";
      if (lower.includes("youtube")) return "YouTube";
    }
    return "Web";
  }, z.enum([
    "GitHub Trending",
    "Reddit",
    "Hacker News",
    "Product Hunt",
    "YouTube",
    "Web",
  ])),
  score: z.preprocess((v) => normalizeNumber(v, 88), z.number()),
  growth: z.preprocess((v) => normalizeNumber(v, 120), z.number()),
  competition,
  format: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Tutorial"), z.string().min(1)),
  length: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "8-12 mins"), z.string().min(1)),
});

export const ideaSchema = z.object({
  title: z.preprocess((v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : ""), z.string().min(1)),
  viral: z.preprocess((v) => normalizeNumber(v, 88), z.number()),
  demand,
  difficulty,
  audience: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Developers and tech creators"), z.string().min(1)),
});


export const titleSchema = z.object({
  rank: z.preprocess((v) => (typeof v === "number" ? v : undefined), z.number().optional()),
  title: z.preprocess((v) => (typeof v === "string" ? v.trim() : String(v || "Untitled Title")), z.string().min(1)),
  angle: z.string().optional(),
  style: z.string().optional(),
  ctrPotential: z.preprocess((v) => {
    if (typeof v === "string") {
      const lower = v.toLowerCase();
      if (lower.includes("very high")) return "Very High";
      if (lower.includes("high")) return "High";
      if (lower.includes("low")) return "Low";
      return "Medium";
    }
    return undefined;
  }, z.enum(["Very High", "High", "Medium", "Low"]).optional()),
  ctr: z.preprocess((v) => (v !== undefined ? normalizeNumber(v, 8.5) : undefined), z.number().optional()),
  score: z.preprocess((v) => (v !== undefined ? normalizeNumber(v, 85) : undefined), z.number().optional()),
  whyItWorks: z.string().optional(),
});

export const titleIntelligenceSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  researchStatus: z.enum(["Research-backed", "AI-generated from topic knowledge", "Limited research available"]),
  opportunity: z.string(),
  observedAngles: z.array(z.string()),
  titles: z.array(titleSchema),
});

export const scriptSectionSchema = z.object({
  heading: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Key Section"), z.string().min(1)),
  purpose: z.string().optional(),
  content: z.preprocess((v) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : ""), z.string()),
});

export const scriptSchema = z.object({
  mode: z.enum(["outline", "full"]).optional(),
  title: z.string().optional(),
  topic: z.string().optional(),
  audience: z.string().optional(),
  language: z.enum(["English", "Hindi", "Hinglish"]).optional(),
  duration: z.string().optional(),
  format: z.string().optional(),
  hook: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Here is the key insight you need to know today."), z.string().min(1)),
  intro: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Let's dive into the practical details."), z.string().min(1)),
  sections: z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(scriptSectionSchema)),
  cta: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Subscribe for more practical guides!"), z.string().min(1)),
  chapters: z.preprocess((v) => (Array.isArray(v) ? v.map(String) : []), z.array(z.string()).optional()),
  qualityScore: z
    .object({
      relevance: z.number(),
      retention: z.number(),
      naturalness: z.number(),
      overall: z.number(),
    })
    .optional(),
});

export const researchSchema = z.object({
  summary: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Current overview and state of this field."), z.string().min(1)),
  subtopics: z.preprocess((v) => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : ["Core fundamentals"]), z.array(z.string().min(1))),
  gaps: z.preprocess((v) => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : ["Detailed practical benchmarks"]), z.array(z.string().min(1))),
  audienceNeeds: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Practical, hands-on tutorials and workflows."), z.string().min(1)),
});

export const planItemSchema = z.object({
  order: z.preprocess((v) => normalizeNumber(v, 1), z.number()),
  title: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Actionable Video Title"), z.string().min(1)),
  angle: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Practical case study"), z.string().min(1)),
  format: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Tutorial"), z.string().min(1)),
  priority: z.preprocess((v) => normalizeLevel(v, "Medium"), z.enum(["High", "Medium", "Low"])),
});

export const packageSchema = z.object({
  idea: z.object({
    title: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "High-Demand Video Concept"), z.string().min(1)),
    viral: z.preprocess((v) => normalizeNumber(v, 90), z.number()),
    demand,
    difficulty,
    audience: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "Developers and creators"), z.string()),
    whyPromising: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : "High viewer curiosity and engagement."), z.string()),
  }),
  thumbnail: z.preprocess((v) => {
    if (!v || typeof v !== "object") return { layout: "Split-Screen", text: "MUST WATCH", colors: ["#38BDF8", "#0F172A", "#10B981"], emotion: "Curiosity", composition: "Focal Subject" };
    const rec = v as Record<string, unknown>;
    return {
      layout: String(rec.layout || "Focal Subject + Glow"),
      text: String(rec.text || rec.overlayText || rec.title || "MUST WATCH"),
      colors: Array.isArray(rec.colors) ? rec.colors.map(String) : ["#38BDF8", "#0F172A", "#10B981"],
      emotion: String(rec.emotion || "Curiosity"),
      composition: String(rec.composition || "Rule of thirds"),
    };
  }, z.object({
    layout: z.string(),
    text: z.string(),
    colors: z.array(z.string()),
    emotion: z.string(),
    composition: z.string(),
  })),
  script: scriptSchema,
  sources: z.preprocess((v) => {
    if (!Array.isArray(v)) return [{ name: "Official Documentation", note: "Primary reference" }];
    return v.map((item) => {
      if (typeof item === "string") return { name: item, note: "Reference source" };
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        return {
          name: String(rec.name || rec.title || rec.source || "Official Documentation"),
          note: String(rec.note || rec.description || rec.summary || "Topic reference and benchmarks"),
        };
      }
      return { name: "Documentation", note: "Reference" };
    });
  }, z.array(z.object({ name: z.string(), note: z.string() }))),
});


export const keywordSchema = z.object({
  keyword: z.string().min(1),
  intent: z.preprocess((v) => {
    if (typeof v === "string") {
      const lower = v.toLowerCase();
      if (lower.includes("comp")) return "Comparison";
      if (lower.includes("tut")) return "Tutorial";
      if (lower.includes("comm") || lower.includes("buy")) return "Commercial";
      return "Informational";
    }
    return "Informational";
  }, z.enum(["Informational", "Comparison", "Tutorial", "Commercial"])),
  difficulty,
  opportunity: z.preprocess((v) => normalizeNumber(v, 85), z.number()),
});

export const competitorSchema = z.object({
  name: z.string().min(1),
  uploadFreq: z.string(),
  avgViews: z.string(),
  trend: z.preprocess((v) => (typeof v === "string" && v.toLowerCase().includes("down") ? "down" : "up"), z.enum(["up", "down"])),
  lastVideo: z.string(),
  gap: z.string(),
});

export const recommendationSchema = z.object({
  text: z.string().min(1),
  kind: z.preprocess((v) => {
    if (typeof v === "string") {
      const lower = v.toLowerCase();
      if (lower.includes("warn")) return "warning";
      if (lower.includes("opp")) return "opportunity";
      return "insight";
    }
    return "insight";
  }, z.enum(["opportunity", "warning", "insight"])),
});

