import type { ShortsDuration, ShortsScene } from "./shortsIntelligence.js";
import { validateTimeline } from "./shortsValidation.js";

export interface QualityIssue {
  type:
    | "TOPIC_DRIFT"
    | "REPETITION"
    | "CLICHE"
    | "TIMELINE_ERROR"
    | "PACING_ERROR"
    | "EMPTY_CONTENT"
    | "LANGUAGE_MISMATCH";
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface ShortsQualityScorecard {
  topicRelevance: number; // /10
  hookRelevance: number; // /10
  productionQuality: number; // /10
  visualRelevance: number; // /10
  languageQuality: number; // /10
  timelineAccuracy: number; // /10
  overallScore: number; // /100
}

export interface DetailedShortsQualityAssessment {
  humanTestPassed: boolean;
  specificityScore: number;
  durationAccuracy: boolean;
  realismVerdict: string;
  detectedCliches?: string[];
  speechPaceWps: number;
  issues: QualityIssue[];
  scorecard: ShortsQualityScorecard;
}

/**
 * Checks for banned AI buzzwords and generic corporate clichés.
 */
export const BANNED_CLICHES: Array<{ pattern: RegExp; phrase: string }> = [
  { pattern: /\bin today's (fast-paced )?world\b/i, phrase: "in today's world" },
  { pattern: /\bunlock(ing)? (your|the) potential\b/i, phrase: "unlock your potential" },
  { pattern: /\bgame[- ]changer\b/i, phrase: "game changer" },
  { pattern: /\bdelve(s|d)? into\b/i, phrase: "delve into" },
  { pattern: /\ba testament to\b/i, phrase: "a testament to" },
  { pattern: /\bvital role\b/i, phrase: "vital role" },
  { pattern: /\bever[- ]evolving\b/i, phrase: "ever-evolving" },
  { pattern: /\blevel up your\b/i, phrase: "level up your" },
  { pattern: /\bwithout further ado\b/i, phrase: "without further ado" },
  { pattern: /\brevolutionize\b/i, phrase: "revolutionize" },
  { pattern: /\bharness the power of\b/i, phrase: "harness the power of" },
];

/**
 * Extracts meaningful keyword stems from a topic string.
 */
export function extractTopicKeywords(topic: string): string[] {
  const stopWords = new Set([
    "how", "to", "the", "a", "an", "in", "on", "of", "for", "and", "is", "are",
    "why", "what", "with", "from", "at", "by", "this", "that", "it", "do", "does",
    "video", "short", "shorts", "guide", "tips", "tricks", "2025", "2026"
  ]);

  return topic
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Expanded deterministic quality verification engine for creator-grade short-form video.
 */
export function evaluateShortsQuality(
  voiceover: string,
  targetWords: number,
  targetSeconds: number,
  options?: {
    topic?: string;
    keyPoints?: string[];
    scenes?: ShortsScene[];
    language?: "English" | "Hindi" | "Hinglish";
    duration?: ShortsDuration;
  }
): DetailedShortsQualityAssessment {
  const text = voiceover || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const wps = Number((wordCount / (targetSeconds || 45)).toFixed(2));
  const issues: QualityIssue[] = [];

  let topicRelevanceScore = 10;
  let hookRelevanceScore = 10;
  let productionQualityScore = 9.5;
  let visualRelevanceScore = 9.5;
  let languageQualityScore = 10;
  let timelineAccuracyScore = 10;

  // 1. Cliché Detection
  const detectedCliches: string[] = [];
  for (const { pattern, phrase } of BANNED_CLICHES) {
    if (pattern.test(text)) {
      detectedCliches.push(phrase);
      issues.push({
        type: "CLICHE",
        severity: "MEDIUM",
        message: `Detected generic AI cliché: "${phrase}".`,
      });
      languageQualityScore -= 1.5;
    }
  }

  // 2. Empty Content Detection
  if (!text.trim() || wordCount < 5) {
    issues.push({
      type: "EMPTY_CONTENT",
      severity: "HIGH",
      message: "Voiceover script is empty or too short.",
    });
    productionQualityScore -= 4;
  }

  // 3. Speech Pace Calibration
  const durationAccuracy = wps >= 2.1 && wps <= 3.1;
  if (!durationAccuracy && wordCount >= 10) {
    const isSeverePacing = wps < 1.8 || wps > 3.4;
    issues.push({
      type: "PACING_ERROR",
      severity: isSeverePacing ? "HIGH" : "LOW",
      message: `Speech pace is ${wps > 3.1 ? "too fast" : "too slow"} (${wps} words/sec). Target is 2.5 - 2.8 WPS.`,
    });
    timelineAccuracyScore -= isSeverePacing ? 2 : 1;
  }

  // 4. Topic Relevance & Topic Drift
  if (options?.topic) {
    const topicKeywords = extractTopicKeywords(options.topic);
    if (topicKeywords.length > 0) {
      const lowerText = text.toLowerCase();
      const matchedKeywords = topicKeywords.filter((kw) => lowerText.includes(kw));
      const matchRatio = matchedKeywords.length / topicKeywords.length;

      if (matchRatio < 0.3 && topicKeywords.length >= 2) {
        issues.push({
          type: "TOPIC_DRIFT",
          severity: "HIGH",
          message: `Script lacks core topic keywords (${topicKeywords.slice(0, 3).join(", ")}). Possible topic drift.`,
        });
        topicRelevanceScore = Math.max(3, Number((matchRatio * 10).toFixed(1)));
      } else {
        topicRelevanceScore = Math.min(10, Math.max(7, Number((matchRatio * 10).toFixed(1))));
      }
    }
  }

  // 5. Repetition Detection across Scenes
  if (options?.scenes && options.scenes.length > 1) {
    const seenPhrases = new Set<string>();
    for (let i = 0; i < options.scenes.length; i++) {
      const s = options.scenes[i];
      const sceneVoice = (s.voiceover || "").trim().toLowerCase();
      if (sceneVoice.length > 20) {
        if (seenPhrases.has(sceneVoice)) {
          issues.push({
            type: "REPETITION",
            severity: "MEDIUM",
            message: `Scene ${i + 1} repeats identical voiceover text from an earlier scene.`,
          });
          productionQualityScore -= 1.5;
        }
        seenPhrases.add(sceneVoice);
      }
    }
  }

  // 6. Visual Relevance & Production Method Checking
  if (options?.scenes && options.scenes.length > 0) {
    options.scenes.forEach((s, idx) => {
      if (!s.visual || !s.visual.trim()) {
        visualRelevanceScore -= 1;
      }
      if (!s.productionMethod) {
        productionQualityScore -= 0.5;
      }
    });
  }

  // 7. Timeline Integrity Check
  if (options?.scenes && options.duration) {
    const timelineRes = validateTimeline(options.scenes, options.duration);
    if (!timelineRes.valid) {
      timelineRes.issues.forEach((iss) => {
        issues.push({
          type: "TIMELINE_ERROR",
          severity: "MEDIUM",
          message: iss,
        });
      });
      timelineAccuracyScore = Math.max(4, timelineAccuracyScore - timelineRes.issues.length * 1.5);
    }
  }

  // 8. Language Consistency
  if (options?.language === "Hindi") {
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (!hasDevanagari && wordCount > 10) {
      issues.push({
        type: "LANGUAGE_MISMATCH",
        severity: "HIGH",
        message: "Requested Hindi language but output contains no Devanagari script.",
      });
      languageQualityScore -= 5;
    }
  }

  // Clamps
  topicRelevanceScore = Math.max(1, Math.min(10, Number(topicRelevanceScore.toFixed(1))));
  hookRelevanceScore = Math.max(1, Math.min(10, Number(hookRelevanceScore.toFixed(1))));
  productionQualityScore = Math.max(1, Math.min(10, Number(productionQualityScore.toFixed(1))));
  visualRelevanceScore = Math.max(1, Math.min(10, Number(visualRelevanceScore.toFixed(1))));
  languageQualityScore = Math.max(1, Math.min(10, Number(languageQualityScore.toFixed(1))));
  timelineAccuracyScore = Math.max(1, Math.min(10, Number(timelineAccuracyScore.toFixed(1))));

  const overallScore = Math.round(
    ((topicRelevanceScore +
      hookRelevanceScore +
      productionQualityScore +
      visualRelevanceScore +
      languageQualityScore +
      timelineAccuracyScore) /
      60) *
      100
  );

  const humanTestPassed = detectedCliches.length === 0;

  let realismVerdict = "Natural creator flow with well-calibrated pacing and zero generic AI filler.";
  if (detectedCliches.length > 0) {
    realismVerdict = `Flagged ${detectedCliches.length} generic AI cliché(s): "${detectedCliches.join(', ')}". Review spoken script to maintain natural human voice.`;
  } else if (!durationAccuracy) {
    realismVerdict = `Pacing is ${wps > 3.1 ? "too fast" : "a bit slow"} (${wps} words/sec). Target is ~2.5 - 2.8 words/sec.`;
  } else if (issues.length > 0) {
    realismVerdict = issues[0].message;
  }

  return {
    humanTestPassed,
    specificityScore: overallScore,
    durationAccuracy,
    realismVerdict,
    detectedCliches: detectedCliches.length > 0 ? detectedCliches : undefined,
    speechPaceWps: wps,
    issues,
    scorecard: {
      topicRelevance: topicRelevanceScore,
      hookRelevance: hookRelevanceScore,
      productionQuality: productionQualityScore,
      visualRelevance: visualRelevanceScore,
      languageQuality: languageQualityScore,
      timelineAccuracy: timelineAccuracyScore,
      overallScore,
    },
  };
}
