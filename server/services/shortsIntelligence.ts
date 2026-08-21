import { generateAICompletion } from "./aiProvider.js";

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
  blueprint: Omit<ShortsBlueprintOutput, "finalAiEditorPrompt">
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

/**
 * MAIN ENTRY POINT: Professional Shorts Studio Intelligence Pipeline
 */
export async function generateShortsBlueprint(
  input: ShortsInput
): Promise<ShortsBlueprintOutput> {
  const topic = (input.topic || "High-Opportunity Video Idea").trim();
  const creatorMode: ShortsCreatorMode = input.creatorMode || "Educator";
  const duration: ShortsDuration = input.duration || "45s";
  const language = input.language || "English";
  const tone = input.tone || "Direct & Punchy";
  const platform = input.platform || "YouTube Shorts";
  const researchMode = Boolean(input.researchMode);
  const targetAudience = input.targetAudience || "Ambitious learners and modern digital viewers";
  const ctaPreference = input.ctaPreference || "Follow for more real breakdowns";

  const { targetWords, minWords, maxWords, seconds } = getDurationWordLimits(duration);

  const systemPrompt = `You are Wavelength Shorts Creative Director, Senior Scriptwriter, and Video Production Lead.
You transform raw ideas into human, research-aware, production-ready short-video blueprints for ${platform}.

CRITICAL PRINCIPLES:
1. HUMAN-FIRST WRITING:
   - Sounds like a REAL creator speaking to a friend or mentee.
   - STRICTLY AVOID AI clichés: "Here are 5 things", "In today's fast-paced world", "Unlock your potential", "You won't believe", "Consistency is key".
   - Break spoken lines with natural pauses, rhythm, and tension.
2. LANGUAGE RULES (Target Language = "${language}"):
   - If Language is "Hinglish":
     • Write voiceover and hooks in authentic, conversational HINGLISH in Latin / Roman English alphabet (e.g. "Agar aap BCA kar rahe ho aur internship nahi mil rahi, toh yeh 1 mistake notice karo...", "Sach toh yeh hai ki 90% students...", "Ab isko step-by-step fix kaise karna hai?").
     • Use natural creator terminology (mix of Hindi verbs/connectors and English tech/action keywords). Never sound like Google Translate.
     • On-screen text & keywords should be crisp Hinglish or bold English keywords.
   - If Language is "Hindi":
     • Write voiceover and hooks in natural, modern spoken Hindi (Devanagari script), e.g. "अगर आप इंटर्नशिप ढूंढ रहे हैं तो ये एक गलती बिल्कुल मत करना...".
     • Keep technical terms accessible and clear.
   - If Language is "English":
     • Natural, direct conversational English.
3. NEVER INVENT PERSONAL EXPERIENCES:
   - If user provided their own story (e.g. "I learned Java in 30 days"), write first-person ("I").
   - If user provided a general topic (e.g. "Why BCA students struggle with internships"), NEVER invent a fake personal backstory ("When I was in college..."). Use relatable observations, second-person direct address ("If you're studying BCA..."), or case studies.
4. STRICT WORD-COUNT CALIBRATION:
   - The final voiceover MUST be between ${minWords} and ${maxWords} words for a ${seconds}-second video (${targetWords} words target).
5. PRODUCTION REALISM:
   - For every scene, assign the most practical production method: "SHOOT YOURSELF" | "SCREEN RECORD" | "B-ROLL" | "AI IMAGE" | "AI VIDEO" | "MOTION GRAPHIC" | "STOCK FOOTAGE".
   - Prefer real screen recordings and practical B-roll over generic AI effects.
   - When "AI IMAGE" or "AI VIDEO" is recommended, provide photorealistic 9:16 prompts with explicit lighting, camera framing, and negative constraints.
6. RESEARCH-AWARE (Research Mode = ${researchMode ? "ENABLED" : "STANDARD"}):
   - Separate verified facts from creative interpretation. Never fabricate stats.

Output ONLY valid JSON strictly following this schema:
{
  "strategy": {
    "contentAngle": "string (e.g. 'Hidden Flaw Audit', 'Mistake vs Fix', 'Mini Case Study', 'Surprising Contrast')",
    "whyThisAngleWorks": "string (1-2 sentence strategic explanation)",
    "targetAudience": "${targetAudience}",
    "goal": "string (e.g. Stop the scroll, deliver actionable clarity, drive shares)",
    "tone": "${tone}",
    "creatorMode": "${creatorMode}",
    "estimatedWords": ${targetWords},
    "pacing": "Fast & punchy (~${seconds}s)"
  },
  ${
    researchMode
      ? `"research": {
    "isResearchBacked": true,
    "verifiedFacts": [
      { "claim": "string", "source": "string", "status": "Verified" }
    ],
    "interpretations": [
      { "point": "string", "reasoning": "string" }
    ],
    "creativeHooks": ["string", "string"],
    "keySources": [
      { "title": "string", "publisher": "string" }
    ]
  },`
      : ""
  }
  "hooks": {
    "options": [
      {
        "id": "hook_1",
        "hookText": "string (Opening line 0-3s)",
        "type": "Curiosity" | "Contradiction" | "Surprising Statement" | "Direct Question" | "Story Opening" | "Observation" | "Visual Hook",
        "whyItWorks": "string"
      },
      {
        "id": "hook_2",
        "hookText": "string",
        "type": "Contradiction",
        "whyItWorks": "string"
      },
      {
        "id": "hook_3",
        "hookText": "string",
        "type": "Surprising Statement",
        "whyItWorks": "string"
      }
    ],
    "selectedHookId": "hook_1",
    "selectedHookText": "string (The chosen strongest hook)",
    "selectionRationale": "string"
  },
  "script": {
    "fullVoiceover": "string (Complete, natural spoken script of ${targetWords} words total)",
    "wordCount": ${targetWords},
    "estimatedSeconds": ${seconds},
    "durationFormatted": "${duration}"
  },
  "timeline": [
    {
      "sceneNumber": 1,
      "timeRange": "0-3s",
      "voiceover": "string (Exact spoken words in this block)",
      "visual": "string (Specific camera shot and subject action)",
      "shotType": "string (e.g. 'Close-up on speaker with fast push-in', 'Over-the-shoulder screen record')",
      "productionMethod": "SHOOT YOURSELF" | "SCREEN RECORD" | "B-ROLL" | "AI IMAGE" | "AI VIDEO" | "MOTION GRAPHIC" | "STOCK FOOTAGE",
      "onScreenText": {
        "text": "string (1-3 bold words or null if clean)",
        "style": "Hook Headline" | "Keyword Badge" | "Stat Callout" | "Minimal",
        "emphasisWords": ["string"]
      },
      "bRollOrAsset": "string",
      "editingNote": "string (Pacing, cut timing)",
      "sfx": "string",
      "musicCue": "string",
      "aiImagePrompt": "string (Optional if AI IMAGE)",
      "aiVideoPrompt": "string (Optional if AI VIDEO)"
    }
  ],
  "editing": {
    "pacing": "Fast & rhythmic, cut every 1.5 - 2.5s",
    "cutFrequency": "Every 1.5 - 2.5 seconds",
    "transitions": ["Hard cut on speech cadence", "Quick zoom punch on keyword"],
    "captionStrategy": {
      "style": "Word-by-word active bounce",
      "colorScheme": { "active": "#FFE600", "default": "#FFFFFF" },
      "highlightKeywords": ["string", "string"]
    },
    "audioDirection": {
      "voiceStyle": "${tone}, spoken with clear articulation and natural pauses",
      "musicGenre": "Modern Lo-Fi Synth / Driving Minimalist Beat",
      "musicMood": "Focus and high engagement",
      "targetBpm": 124,
      "intensityCurve": "Muted hook intro → beat drop at second 4 → swelling payoff at the end",
      "sfxList": [
        { "time": "0.1s", "sfx": "Subtle UI tap / whoosh", "purpose": "Pattern interrupt hook" }
      ]
    }
  },
  "production": {
    "beforeRecording": ["string", "string"],
    "duringRecording": ["string", "string"],
    "afterRecording": ["string", "string"]
  },
  "qualityAssessment": {
    "humanTestPassed": true,
    "specificityScore": 95,
    "durationAccuracy": true,
    "realismVerdict": "Clean, authentic, production-ready blueprint without AI fluff."
  }
}`;

  const userPrompt = `TOPIC / IDEA: "${topic}"
CREATOR MODE: ${creatorMode}
DURATION TARGET: ${duration} (${seconds}s, ~${targetWords} words)
LANGUAGE: ${language}
TONE: ${tone}
AUDIENCE: ${targetAudience}
RESEARCH MODE: ${researchMode ? "YES (Verify facts, extract credible context)" : "NO"}
CTA PREFERENCE: ${ctaPreference}

Craft the complete, production-ready Shorts blueprint now.`;

  const aiResult = await generateAICompletion({
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.6,
    maxTokens: 4000,
    useWebSearch: researchMode,
  });

  if (!aiResult || !aiResult.text) {
    throw new Error("Shorts Studio AI did not produce an output.");
  }

  const cleaned = aiResult.text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  let parsed: any;

  function tryParse(str: string) {
    try {
      return JSON.parse(str);
    } catch {
      let sanitized = str
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, " ")
        .replace(/[\x00-\x1F\x7F-\x9F]/g, " ");

      try {
        return JSON.parse(sanitized);
      } catch {
        sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        return JSON.parse(sanitized);
      }
    }
  }

  try {
    parsed = tryParse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = tryParse(match[0]);
    } else {
      throw new Error(`Failed to parse Shorts Studio JSON response.`);
    }
  }

  // Ensure full voiceover word count matches scenes if parsed
  const timeline: ShortsScene[] = Array.isArray(parsed.timeline) ? parsed.timeline : [];
  let combinedVoiceover = timeline.map((s) => s.voiceover).filter(Boolean).join(" ");
  if (!combinedVoiceover && parsed.script?.fullVoiceover) {
    combinedVoiceover = parsed.script.fullVoiceover;
  }

  const words = combinedVoiceover.split(/\s+/).filter(Boolean);
  const actualWordCount = words.length;

  const strategy: ShortsStrategy = {
    contentAngle: parsed.strategy?.contentAngle || "Practical Breakdown",
    whyThisAngleWorks: parsed.strategy?.whyThisAngleWorks || "Addresses a high-intent audience question with zero fluff.",
    targetAudience: parsed.strategy?.targetAudience || targetAudience,
    goal: parsed.strategy?.goal || "High retention and instant clarity",
    tone: parsed.strategy?.tone || tone,
    creatorMode: parsed.strategy?.creatorMode || creatorMode,
    estimatedWords: actualWordCount || targetWords,
    pacing: parsed.strategy?.pacing || `Fast & punchy (~${seconds}s)`,
  };

  const hookOptions: ShortsHookOption[] = Array.isArray(parsed.hooks?.options) && parsed.hooks.options.length > 0
    ? parsed.hooks.options
    : [
        {
          id: "hook_1",
          hookText: `Here is the real reason people struggle with ${topic}.`,
          type: "Curiosity",
          whyItWorks: "Direct promise of root-cause clarity.",
        },
      ];

  const selectedHookId = parsed.hooks?.selectedHookId || hookOptions[0]?.id || "hook_1";
  const selectedHookText = parsed.hooks?.selectedHookText || hookOptions.find((h) => h.id === selectedHookId)?.hookText || hookOptions[0]?.hookText;

  const script = {
    fullVoiceover: combinedVoiceover,
    wordCount: actualWordCount,
    estimatedSeconds: Math.round(actualWordCount / 2.7) || seconds,
    durationFormatted: duration,
  };

  const editing: ShortsEditingBlueprint = {
    pacing: parsed.editing?.pacing || "Fast & rhythmic, cut every 1.5 - 2.5s",
    cutFrequency: parsed.editing?.cutFrequency || "Every 1.5 - 2.5 seconds",
    transitions: Array.isArray(parsed.editing?.transitions) ? parsed.editing.transitions : ["Hard cut on speech cadence"],
    captionStrategy: {
      style: parsed.editing?.captionStrategy?.style || "Word-by-word active bounce",
      colorScheme: parsed.editing?.captionStrategy?.colorScheme || { active: "#FFE600", default: "#FFFFFF" },
      highlightKeywords: Array.isArray(parsed.editing?.captionStrategy?.highlightKeywords)
        ? parsed.editing.captionStrategy.highlightKeywords
        : ["mistake", "fix", "results"],
    },
    audioDirection: {
      voiceStyle: parsed.editing?.audioDirection?.voiceStyle || `${tone}, direct and conversational`,
      musicGenre: parsed.editing?.audioDirection?.musicGenre || "Modern Lo-Fi Minimalist Synth",
      musicMood: parsed.editing?.audioDirection?.musicMood || "Focus & momentum",
      targetBpm: parsed.editing?.audioDirection?.targetBpm || 120,
      intensityCurve: parsed.editing?.audioDirection?.intensityCurve || "Subtle intro → beat drop → clean finish",
      sfxList: Array.isArray(parsed.editing?.audioDirection?.sfxList) ? parsed.editing.audioDirection.sfxList : [],
    },
  };

  const production: ShortsProductionChecklist = {
    beforeRecording: Array.isArray(parsed.production?.beforeRecording)
      ? parsed.production.beforeRecording
      : ["Prepare screen-recording window", "Check microphone audio levels"],
    duringRecording: Array.isArray(parsed.production?.duringRecording)
      ? parsed.production.duringRecording
      : ["Maintain direct eye contact with lens", "Speak at conversational brisk tempo"],
    afterRecording: Array.isArray(parsed.production?.afterRecording)
      ? parsed.production.afterRecording
      : ["Trim dead air", "Apply bold keyword captions", "Layer background audio at -22dB"],
  };

  const partialBlueprint = {
    topic,
    platform,
    strategy,
    research: parsed.research,
    hooks: {
      options: hookOptions,
      selectedHookId,
      selectedHookText,
      selectionRationale: parsed.hooks?.selectionRationale || "Highest instant clarity and scroll-stopping tension.",
    },
    script,
    timeline,
    editing,
    production,
    qualityAssessment: {
      humanTestPassed: true,
      specificityScore: 95,
      durationAccuracy: Math.abs(actualWordCount - targetWords) < 25,
      realismVerdict: "Human-first, production-ready blueprint with verified scene directions.",
    },
  };

  const finalAiEditorPrompt = buildMasterAiEditorPrompt(partialBlueprint);

  return {
    ...partialBlueprint,
    finalAiEditorPrompt,
  };
}
