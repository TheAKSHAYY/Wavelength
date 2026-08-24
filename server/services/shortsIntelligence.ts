import { generateShortsStrategy } from "./shortsStrategy.js";
import { generateShortsProduction } from "./shortsProduction.js";
import { evaluateShortsQuality, type DetailedShortsQualityAssessment } from "./shortsQuality.js";
import { repairShortsBlueprint } from "./shortsRepair.js";

export type ShortsCreatorMode =
  | "Personal Creator"
  | "Educator"
  | "Storyteller"
  | "Commentary"
  | "Explainer"
  | "Experiment"
  | "Faceless Creator"
  | "Tutorial";

export type ShortsDuration = "15s" | "30s" | "45s" | "60s";

export type ShortsProductionMethod =
  | "SHOOT YOURSELF"
  | "SCREEN RECORD"
  | "B-ROLL"
  | "AI IMAGE"
  | "AI VIDEO"
  | "MOTION GRAPHIC"
  | "STOCK FOOTAGE";

export interface ShortsInput {
  topic: string;
  creatorMode?: ShortsCreatorMode;
  duration?: ShortsDuration;
  language?: "English" | "Hindi" | "Hinglish";
  tone?: string;
  targetAudience?: string;
  researchMode?: boolean;
  ctaPreference?: string;
  platform?: "YouTube Shorts" | "Instagram Reels" | "TikTok";
}

export interface ShortsStrategy {
  contentAngle: string;
  whyThisAngleWorks: string;
  targetAudience: string;
  goal: string;
  tone: string;
  creatorMode: ShortsCreatorMode;
  estimatedWords: number;
  pacing: string;
}

export interface ShortsHookOption {
  id: string;
  hookText: string;
  type: "Curiosity" | "Contradiction" | "Surprising Statement" | "Direct Question" | "Story Opening" | "Observation" | "Visual Hook";
  whyItWorks: string;
}

export interface ShortsResearchData {
  isResearchBacked: boolean;
  verifiedFacts: Array<{ claim: string; source: string; status: "Verified" | "Contextual" }>;
  interpretations: Array<{ point: string; reasoning: string }>;
  creativeHooks: string[];
  keySources: Array<{ title: string; url?: string; publisher?: string }>;
}

export interface ShortsScene {
  sceneNumber: number;
  timeRange: string;
  voiceover: string;
  visual: string;
  shotType: string;
  productionMethod: ShortsProductionMethod;
  onScreenText?: {
    text: string;
    style: "Hook Headline" | "Keyword Badge" | "Stat Callout" | "Minimal";
    emphasisWords: string[];
  };
  bRollOrAsset?: string;
  editingNote: string;
  sfx: string;
  musicCue: string;
  aiImagePrompt?: string;
  aiVideoPrompt?: string;
}

export interface ShortsEditingBlueprint {
  pacing: string;
  cutFrequency: string;
  transitions: string[];
  captionStrategy: {
    style: "Word-by-word active bounce" | "Two-line clean sans" | "Minimal punchy keywords";
    colorScheme: { active: string; default: string };
    highlightKeywords: string[];
  };
  audioDirection: {
    voiceStyle: string;
    musicGenre: string;
    musicMood: string;
    targetBpm: number;
    intensityCurve: string;
    sfxList: Array<{ time: string; sfx: string; purpose: string }>;
  };
}

export interface ShortsProductionChecklist {
  beforeRecording: string[];
  duringRecording: string[];
  afterRecording: string[];
}

export interface ShortsBlueprintOutput {
  topic: string;
  platform: string;
  strategy: ShortsStrategy;
  research?: ShortsResearchData;
  hooks: {
    options: ShortsHookOption[];
    selectedHookId: string;
    selectedHookText: string;
    selectionRationale: string;
  };
  script: {
    fullVoiceover: string;
    wordCount: number;
    estimatedSeconds: number;
    durationFormatted: string;
  };
  timeline: ShortsScene[];
  editing: ShortsEditingBlueprint;
  production: ShortsProductionChecklist;
  finalAiEditorPrompt: string;
  qualityAssessment: {
    humanTestPassed: boolean;
    specificityScore: number;
    durationAccuracy: boolean;
    realismVerdict: string;
    detectedCliches?: string[];
    speechPaceWps?: number;
  };
}

/**
 * Word budget limits based on natural spoken pace (~2.5 to 2.8 words/second in short-form video).
 */
export function getDurationWordLimits(duration: ShortsDuration): { targetWords: number; minWords: number; maxWords: number; seconds: number } {
  switch (duration) {
    case "15s":
      return { targetWords: 38, minWords: 30, maxWords: 45, seconds: 15 };
    case "30s":
      return { targetWords: 75, minWords: 65, maxWords: 88, seconds: 30 };
    case "45s":
      return { targetWords: 115, minWords: 100, maxWords: 130, seconds: 45 };
    case "60s":
    default:
      return { targetWords: 150, minWords: 135, maxWords: 170, seconds: 60 };
  }
}

/**
 * Builds the consolidated copy-ready prompt for AI Video Editors (CapCut AI, InVideo, Runway, Pika, Premiere).
 */
export function buildMasterAiEditorPrompt(
  blueprint: Omit<ShortsBlueprintOutput, "finalAiEditorPrompt" | "qualityAssessment"> & {
    qualityAssessment?: ShortsBlueprintOutput["qualityAssessment"];
  }
): string {
  const { topic, platform, strategy, script, timeline, editing } = blueprint;

  const scenesStr = timeline
    .map(
      (s) =>
        `[${s.timeRange}] - ${s.productionMethod} (${s.shotType})
Visual: ${s.visual}
Voiceover: "${s.voiceover}"
${s.onScreenText?.text ? `On-Screen Text: "${s.onScreenText.text}"` : ""}
SFX: ${s.sfx || "None"} | Music: ${s.musicCue}`
    )
    .join("\n\n");

  return `Vertical 9:16 Short Video Blueprint for ${platform}
Topic: "${topic}"
Duration: ${strategy.pacing} (~${script.estimatedSeconds}s, ${script.wordCount} words)
Content Angle: ${strategy.contentAngle}
Creator Mode: ${strategy.creatorMode}
Audio Vibe: ${editing.audioDirection.musicGenre} (${editing.audioDirection.musicMood}, ~${editing.audioDirection.targetBpm} BPM)

FULL SPOKEN VOICEOVER:
"${script.fullVoiceover}"

SCENE-BY-SCENE EDITING TIMELINE:
${scenesStr}

CAPTIONS & TYPOGRAPHY:
Style: ${editing.captionStrategy.style}
Active Highlight Color: ${editing.captionStrategy.colorScheme.active}
Key Keywords to Pop: ${editing.captionStrategy.highlightKeywords.join(", ")}

EDITING RULES:
- Aspect Ratio: 9:16 (1080x1920 vertical)
- Pacing: ${editing.pacing} with cut frequency of ${editing.cutFrequency}
- Transitions: ${editing.transitions.join(", ")}
- Keep the visual authentic, zero corporate stock footage cliches, strict synchronization between spoken words and visual evidence.`.trim();
}

// Re-export evaluateShortsQuality so existing tests and modules can use it
export { evaluateShortsQuality };

/**
 * MAIN ENTRY POINT: Two-Stage Creator-First Shorts Studio Intelligence Pipeline
 *
 * Architecture:
 * 1. User Input + Context -> Stage 1 Content Strategist (Deep Topic Understanding, Angles, Hooks)
 * 2. Stage 1 Strategy -> Stage 2 Shorts Production Director (Scene Timeline, Visuals, Voiceover)
 * 3. Exact Timeline Validation & Deterministic QA
 * 4. AI Targeted Repair Pipeline (if high-severity defects detected)
 * 5. Production Blueprint Output
 */
export async function generateShortsBlueprint(
  input: ShortsInput
): Promise<ShortsBlueprintOutput> {
  const duration: ShortsDuration = input.duration || "45s";
  const { targetWords, seconds } = getDurationWordLimits(duration);

  // STAGE 1: Content Strategist
  const strategy = await generateShortsStrategy(input);

  // STAGE 2: Production Director
  let productionBlueprint = await generateShortsProduction(input, strategy);

  // STAGE 3: Deterministic QA & Timeline Validation
  let qa: DetailedShortsQualityAssessment = evaluateShortsQuality(
    productionBlueprint.script.fullVoiceover,
    targetWords,
    seconds,
    {
      topic: input.topic,
      keyPoints: strategy.keyPoints,
      scenes: productionBlueprint.timeline,
      language: input.language,
      duration,
    }
  );

  // STAGE 4: Targeted AI Repair (if critical issues found)
  const highSeverityIssues = qa.issues.filter((i) => i.severity === "HIGH");
  if (highSeverityIssues.length > 0) {
    try {
      productionBlueprint = await repairShortsBlueprint(
        productionBlueprint,
        highSeverityIssues,
        duration
      );

      // Re-run QA post-repair
      qa = evaluateShortsQuality(
        productionBlueprint.script.fullVoiceover,
        targetWords,
        seconds,
        {
          topic: input.topic,
          keyPoints: strategy.keyPoints,
          scenes: productionBlueprint.timeline,
          language: input.language,
          duration,
        }
      );
    } catch (repairErr) {
      console.warn("Repair step error, continuing with production blueprint:", repairErr);
    }
  }

  return {
    ...productionBlueprint,
    qualityAssessment: {
      humanTestPassed: qa.humanTestPassed,
      specificityScore: qa.specificityScore,
      durationAccuracy: qa.durationAccuracy,
      realismVerdict: qa.realismVerdict,
      detectedCliches: qa.detectedCliches,
      speechPaceWps: qa.speechPaceWps,
    },
  };
}
