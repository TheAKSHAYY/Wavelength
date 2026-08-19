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
  rank: z.number().optional(),
  title: z.string().min(1),
  angle: z.string().optional(),
  style: z.string().optional(),
  ctrPotential: z.enum(["Very High", "High", "Medium", "Low"]).optional(),
  ctr: z.number().optional(),
  score: z.number().optional(),
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
  heading: z.string().min(1),
  purpose: z.string().optional(),
  content: z.string(),
});

export const scriptSchema = z.object({
  mode: z.enum(["outline", "full"]).optional(),
  title: z.string().optional(),
  topic: z.string().optional(),
  audience: z.string().optional(),
  language: z.enum(["English", "Hindi", "Hinglish"]).optional(),
  duration: z.string().optional(),
  format: z.string().optional(),
  hook: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(scriptSectionSchema),
  cta: z.string().min(1),
  chapters: z.array(z.string()).optional(),
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
