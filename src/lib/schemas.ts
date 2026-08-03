import { z } from "zod";

const competition = z.enum(["Low", "Medium", "High"]);
const demand = z.enum(["Low", "Medium", "High"]);
const difficulty = z.enum(["Low", "Medium", "High"]);

export const trendSchema = z.object({
  topic: z.string().min(1),
  source: z.enum([
    "GitHub Trending",
    "Reddit",
    "Hacker News",
    "Product Hunt",
    "YouTube",
    "Web",
  ]),
  score: z.number(),
  growth: z.number(),
  competition,
  format: z.string().min(1),
  length: z.string().min(1),
});

export const ideaSchema = z.object({
  title: z.string().min(1),
  viral: z.number(),
  demand,
  difficulty,
  audience: z.string().min(1),
});

export const titleSchema = z.object({
  title: z.string().min(1),
  style: z.string().min(1),
  ctr: z.number(),
});

export const scriptSectionSchema = z.object({
  heading: z.string().min(1),
  content: z.string(),
});

export const scriptSchema = z.object({
  hook: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(scriptSectionSchema),
  cta: z.string().min(1),
  chapters: z.array(z.string()).optional(),
});

export const researchSchema = z.object({
  summary: z.string().min(1),
  subtopics: z.array(z.string().min(1)),
  gaps: z.array(z.string().min(1)),
  audienceNeeds: z.string().min(1),
});

export const planItemSchema = z.object({
  order: z.number(),
  title: z.string().min(1),
  angle: z.string().min(1),
  format: z.string().min(1),
  priority: z.enum(["High", "Medium", "Low"]),
});

export const packageSchema = z.object({
  idea: z.object({
    title: z.string().min(1),
    viral: z.number(),
    demand,
    difficulty,
    audience: z.string(),
    whyPromising: z.string(),
  }),
  thumbnail: z.object({
    layout: z.string(),
    text: z.string(),
    colors: z.array(z.string()),
    emotion: z.string(),
    composition: z.string(),
  }),
  script: scriptSchema,
  sources: z.array(z.object({ name: z.string(), note: z.string() })),
});

export const keywordSchema = z.object({
  keyword: z.string().min(1),
  intent: z.enum(["Informational", "Comparison", "Tutorial", "Commercial"]),
  difficulty,
  opportunity: z.number(),
});

export const competitorSchema = z.object({
  name: z.string().min(1),
  uploadFreq: z.string(),
  avgViews: z.string(),
  trend: z.enum(["up", "down"]),
  lastVideo: z.string(),
  gap: z.string(),
});

export const recommendationSchema = z.object({
  text: z.string().min(1),
  kind: z.enum(["opportunity", "warning", "insight"]),
});
