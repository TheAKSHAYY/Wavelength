import { config } from "../config.js";
import { generateAICompletion } from "./aiProvider.js";
import { searchYouTubeVideos, type YouTubeVideoInfo } from "./youtubeResearch.js";

export interface SemanticTopic {
  rawInput: string;
  cleanSubject: string;
  semanticMeaning: string;
  domain: string;
  targetAudience: string;
  coreIntent: string;
  keywords: string[];
}

export interface CompetitorPattern {
  commonAngles: string[];
  saturatedAngles: string[];
  contentGaps: string[];
  recentTopTitles: string[];
}

export interface TitleCandidate {
  rank: number;
  title: string;
  angle: string;
  ctrPotential: "Very High" | "High" | "Medium" | "Low";
  score: number;
  whyItWorks: string;
  framework: string;
}

export interface TitleIntelligenceResult {
  topic: string;
  audience: string;
  researchStatus: "Research-backed" | "AI-generated from topic knowledge" | "Limited research available";
  opportunity: string;
  observedAngles: string[];
  titles: TitleCandidate[];
}

/**
 * 1. SEMANTIC TOPIC UNDERSTANDING
 * Strips UI contamination while strictly preserving non-English (Hindi, Devanagari) and specific niche intent.
 */
export function understandTopicSemantically(input: string): SemanticTopic {
  let cleaned = (input || "")
    .replace(/^video\s+topic:\s*/i, "")
    .replace(/^topic:\s*/i, "")
    .replace(/^video\s+title:\s*/i, "")
    .replace(/^generate\s+(youtube\s+)?titles?\s+(for|about)?\s*/i, "")
    .replace(/^search\s+for\s*/i, "")
    .replace(/\b(video|youtube|title|generator|titles)\b/gi, "")
    .replace(/[\][}{"'\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 2) {
    cleaned = (input || "").trim() || "General Topic";
  }

  const keywords = cleaned
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.trim());

  return {
    rawInput: input,
    cleanSubject: cleaned,
    semanticMeaning: `Comprehensive content strategy and high-CTR title intelligence for ${cleaned}`,
    domain: "Dynamic Domain",
    targetAudience: `Audience interested in ${cleaned}`,
    coreIntent: `High-value YouTube video ideas and title frameworks for ${cleaned}`,
    keywords,
  };
}

/**
 * 2. LIVE RESEARCH & COMPETITOR PATTERN ANALYSIS (OPTIONAL ENRICHMENT)
 */
export async function performTopicResearch(semantic: SemanticTopic): Promise<{
  researchStatus: "Research-backed" | "AI-generated from topic knowledge" | "Limited research available";
  patterns: CompetitorPattern;
  rawVideos: YouTubeVideoInfo[];
}> {
  if (!config.youtubeApiKey) {
    return {
      researchStatus: "AI-generated from topic knowledge",
      patterns: {
        commonAngles: ["Beginner Roadmaps", "Complete Guides", "Deep Dives"],
        saturatedAngles: ["Generic 10-Hour Lectures", "Standard Year Roadmaps"],
        contentGaps: [
          `Actionable, real-world execution and common pitfalls in ${semantic.cleanSubject}`,
          `Honest timelines and realistic progression`,
        ],
        recentTopTitles: [],
      },
      rawVideos: [],
    };
  }

  try {
    const [topVideos, recentVideos] = await Promise.all([
      searchYouTubeVideos(semantic.cleanSubject, { order: "viewCount", maxResults: 6 }),
      searchYouTubeVideos(semantic.cleanSubject, { order: "relevance", maxResults: 6 }),
    ]);

    const combined = [...topVideos, ...recentVideos];
    const seen = new Set<string>();
    const uniqueVideos: YouTubeVideoInfo[] = [];

    for (const v of combined) {
      if (!seen.has(v.id) && v.title) {
        seen.add(v.id);
        uniqueVideos.push(v);
      }
    }

    const titles = uniqueVideos.map((v) => v.title);
    return {
      researchStatus: uniqueVideos.length > 0 ? "Research-backed" : "Limited research available",
      patterns: {
        commonAngles: ["Tutorials", "Beginner Guides", "Comparison Breakdowns"],
        saturatedAngles: ["Generic Full Overviews"],
        contentGaps: [
          `Practical problem-solving breakdowns that skip fluff in ${semantic.cleanSubject}`,
          `Honest mistakes and pitfalls that waste time for beginners in ${semantic.cleanSubject}`,
        ],
        recentTopTitles: titles.slice(0, 5),
      },
      rawVideos: uniqueVideos,
    };
  } catch (err) {
    console.warn("YouTube research failed, falling back to AI knowledge:", err);
    return {
      researchStatus: "AI-generated from topic knowledge",
      patterns: {
        commonAngles: ["Tutorials", "Guides", "Explainers"],
        saturatedAngles: ["Generic 10-Hour Courses"],
        contentGaps: [`Actionable execution for ${semantic.cleanSubject}`],
        recentTopTitles: [],
      },
      rawVideos: [],
    };
  }
}

/**
 * 3. AI-POWERED TITLE INTELLIGENCE RUNNER
 * Generates 10 distinct, creator-grade titles across 10 psychological frameworks for ANY topic,
 * accurately preserving Hindi/English/Hinglish intent.
 */
export async function runTitleIntelligencePipeline(input: string): Promise<TitleIntelligenceResult> {
  const semantic = understandTopicSemantically(input);
  const research = await performTopicResearch(semantic);

  const competitorContext = research.patterns.recentTopTitles.length
    ? `Recent competitor videos in this niche:\n${research.patterns.recentTopTitles.map((t) => `- ${t}`).join("\n")}`
    : "";

  const systemPrompt = `You are a world-class YouTube Title Strategist and CTR Consultant.
Your job is to analyze the user's topic and produce 10 genuinely distinct, high-CTR YouTube video titles using proven psychological frameworks.

CRITICAL RULES:
1. THE USER'S EXACT TOPIC AND LANGUAGE ARE THE SOURCE OF TRUTH.
   - If the user writes in Hindi (e.g. "घर पर बिरयानी कैसे बनाएं"), generate titles in natural Hindi.
   - If the user writes in Hinglish (e.g. "Freelancing start kaise karein"), generate titles in creator Hinglish.
   - If English, generate engaging creator English titles.
2. NEVER use generic placeholder templates or mention coding/software unless the topic is actually coding.
3. Every single title must be tailored to the specific domain (e.g. food, gaming, fitness, finance, movies, travel, tech, etc.).
4. Utilize these 10 distinct psychological frameworks:
   - Framework 1: "Curiosity Gap / Open Loop"
   - Framework 2: "Beginner Pain Point / Frustration"
   - Framework 3: "Contrarian / Myth Busting"
   - Framework 4: "Mistakes to Avoid / Risk"
   - Framework 5: "Structured Roadmap / Timeline"
   - Framework 6: "Personal Proof / Case Study"
   - Framework 7: "80/20 High-Leverage Rule"
   - Framework 8: "Transformation / Result-Driven"
   - Framework 9: "Strategic Decision / Comparison"
   - Framework 10: "Vulnerable Story / Real Experience"

5. Respond with ONLY valid JSON with this exact schema:
{
  "topic": "${semantic.cleanSubject}",
  "audience": "string (specific target audience for this topic)",
  "opportunity": "string (key underserved content gap in this topic)",
  "observedAngles": ["string", "string", "string"],
  "titles": [
    {
      "rank": 1,
      "title": "string (engaging, high-CTR title)",
      "angle": "string (angle name)",
      "ctrPotential": "Very High" | "High" | "Medium" | "Low",
      "score": number (75-98),
      "whyItWorks": "string (1-2 sentences on why this hooks viewers)",
      "framework": "string (the psychological framework used)"
    }
  ]
}`;

  const userPrompt = `Target Topic: "${semantic.cleanSubject}"\nRaw Input: "${input}"\n${competitorContext}\n\nGenerate 10 distinct, topic-grounded title frameworks for this exact topic.`;

  const aiResult = await generateAICompletion({
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 4000,
    jsonMode: true,
    useWebSearch: Boolean(research?.researchStatus === "Research-backed"),
  });

  const rawText = aiResult.text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        const sanitized = jsonMatch[0]
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/[\r\n\t]+/g, " ");
        parsed = JSON.parse(sanitized);
      }
    } else {
      throw new Error(`Failed to parse Title Intelligence AI response as JSON: ${rawText.slice(0, 150)}`);
    }
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.titles)
    ? parsed.titles
    : Array.isArray(parsed?.titleCandidates)
    ? parsed.titleCandidates
    : Array.isArray(parsed?.candidates)
    ? parsed.candidates
    : Array.isArray(parsed?.results)
    ? parsed.results
    : [];

  if (rawList.length === 0) {
    throw new Error("AI did not return a valid titles array.");
  }

  const validatedTitles: TitleCandidate[] = rawList.map((t: any, idx: number) => {
    const titleText = typeof t === "string" ? t : (t.title || t.name || t.text || "");
    const score = typeof t.score === "number" ? Math.min(98, Math.max(70, t.score)) : 90 - idx * 2;
    const ctrPotential =
      t.ctrPotential && ["Very High", "High", "Medium", "Low"].includes(t.ctrPotential)
        ? t.ctrPotential
        : score >= 90
        ? "Very High"
        : score >= 84
        ? "High"
        : score >= 75
        ? "Medium"
        : "Low";

    return {
      rank: idx + 1,
      title: String(titleText || `Mastering ${semantic.cleanSubject}`).trim(),
      angle: String(t.angle || "Core Guide").trim(),
      ctrPotential,
      score,
      whyItWorks: String(t.whyItWorks || "Hooks viewer curiosity with clear value proposition.").trim(),
      framework: String(t.framework || `Framework ${idx + 1}`).trim(),
    };
  });

  return {
    topic: parsed.topic || semantic.cleanSubject,
    audience: parsed.audience || semantic.targetAudience,
    researchStatus: research.researchStatus,
    opportunity: parsed.opportunity || research.patterns.contentGaps[0] || `Actionable insights for ${semantic.cleanSubject}`,
    observedAngles: Array.isArray(parsed.observedAngles) && parsed.observedAngles.length > 0 ? parsed.observedAngles : research.patterns.commonAngles,
    titles: validatedTitles.slice(0, 10),
  };
}
