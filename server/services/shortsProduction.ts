import { generateAICompletion } from "./aiProvider.js";
import type {
  ShortsBlueprintOutput,
  ShortsCreatorMode,
  ShortsDuration,
  ShortsEditingBlueprint,
  ShortsInput,
  ShortsProductionChecklist,
  ShortsScene,
} from "./shortsIntelligence.js";
import { buildMasterAiEditorPrompt } from "./shortsIntelligence.js";
import type { Stage1StrategyOutput } from "./shortsStrategy.js";

/**
 * STAGE 2 — Shorts Production Director
 * Translates the strategic foundation into a scene-by-scene production timeline and spoken voiceover.
 */
export async function generateShortsProduction(
  input: ShortsInput,
  strategy: Stage1StrategyOutput
): Promise<Omit<ShortsBlueprintOutput, "qualityAssessment">> {
  const duration: ShortsDuration = input.duration || "45s";
  const creatorMode: ShortsCreatorMode = input.creatorMode || "Educator";
  const platform = input.platform || "YouTube Shorts";

  const targetWords = strategy.wordBudget;
  const seconds = strategy.targetDurationSeconds;

  const keyPointsList = strategy.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const factsList = strategy.factsToCommunicate.length > 0
    ? strategy.factsToCommunicate.map((f, _i) => `- ${f}`).join("\n")
    : "Standard verified topic facts";

  const systemPrompt = `You are Wavelength's Senior Shorts Production Director and Video Editor.
Your job is to take the Stage 1 Strategy for "${strategy.topic}" and generate a production-ready, scene-by-scene vertical (9:16) video blueprint for ${platform}.

STAGE 1 STRATEGY CONTEXT:
- Core Concept: "${strategy.coreConcept}"
- Content Angle: "${strategy.contentAngle}"
- Selected Hook: "${strategy.selectedHookText}"
- Tone: "${strategy.tone}"
- Language: "${strategy.language}"
- Target Duration: ${seconds} seconds (~${targetWords} words total)
- Key Points to cover:
${keyPointsList}
- Key Facts:
${factsList}

PRODUCTION GUIDELINES:
1. SCRIPT & PACING:
   - Begin immediately with the chosen hook: "${strategy.selectedHookText}".
   - Write natural, conversational, punchy lines without AI filler ("In today's world", "Unlock your potential", etc.).
   - Spoken script word count must be ~${targetWords} words total.
   - For Language = "${strategy.language}":
     • If "Hinglish": write authentic Latin script Hinglish.
     • If "Hindi": write in natural Devanagari script.
     • If "English": write natural conversational English.
2. PRODUCTION METHODS & VISUAL RELEVANCE:
   - For each scene, infer the most authentic, domain-appropriate production method:
     • Coding & Software: "SCREEN RECORD" or "MOTION GRAPHIC"
     • Science & Astronomy & Biology: "MOTION GRAPHIC" or "AI IMAGE" / "AI VIDEO" (photorealistic 9:16 concept/diagram)
     • History & Documentaries: "STOCK FOOTAGE", "MOTION GRAPHIC", or "AI IMAGE"
     • Personal Advice & Education: "SHOOT YOURSELF" or "B-ROLL"
     • Gaming & Entertainment: "SCREEN RECORD", "B-ROLL", or "MOTION GRAPHIC"
   - Never show a generic "person at desk" for space, biology, or history topics. Align every visual description directly with the words spoken in that scene.
   - If AI IMAGE is recommended, provide a crisp 9:16 prompt with lighting and composition.
3. TIMELINE & SYNCHRONIZATION:
   - Allocate 3 to 6 scenes covering 0s to ${seconds}s sequentially (e.g. "0-3s", "3-12s", "12-25s", "25-38s", "38-${seconds}s").
   - Total scene durations must equal ${seconds}s.

Output ONLY valid JSON strictly matching this schema:
{
  "fullVoiceover": "string (Complete continuous spoken script of ~${targetWords} words)",
  "timeline": [
    {
      "sceneNumber": 1,
      "timeRange": "0-3s",
      "voiceover": "string (Exact spoken words in this scene, starting with hook)",
      "visual": "string (Visual subject and action)",
      "shotType": "string (e.g. 'Close-up speaker push-in', 'Screen record focus')",
      "productionMethod": "SHOOT YOURSELF" | "SCREEN RECORD" | "B-ROLL" | "AI IMAGE" | "AI VIDEO" | "MOTION GRAPHIC" | "STOCK FOOTAGE",
      "onScreenText": {
        "text": "string",
        "style": "Hook Headline" | "Keyword Badge" | "Stat Callout" | "Minimal",
        "emphasisWords": ["string"]
      },
      "bRollOrAsset": "string",
      "editingNote": "string",
      "sfx": "string",
      "musicCue": "string",
      "aiImagePrompt": "string (optional)"
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
      "voiceStyle": "${strategy.tone}, direct and conversational",
      "musicGenre": "Modern Lo-Fi Synth / Driving Minimalist Beat",
      "musicMood": "Focus and momentum",
      "targetBpm": 120,
      "intensityCurve": "Muted hook intro → beat drop → clean finish",
      "sfxList": [
        { "time": "0.1s", "sfx": "Subtle UI tap / whoosh", "purpose": "Pattern interrupt hook" }
      ]
    }
  },
  "production": {
    "beforeRecording": ["string", "string"],
    "duringRecording": ["string", "string"],
    "afterRecording": ["string", "string"]
  }
}`;

  const userPrompt = `TOPIC: "${strategy.topic}"
STRATEGY ANGLE: "${strategy.contentAngle}"
SELECTED HOOK: "${strategy.selectedHookText}"
TARGET DURATION: ${seconds}s (${targetWords} words)
LANGUAGE: "${strategy.language}"

Construct the full Stage 2 production blueprint now.`;

  const aiResult = await generateAICompletion({
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.6,
    maxTokens: 3500,
    jsonMode: true,
  });

  if (!aiResult || !aiResult.text) {
    throw new Error("Stage 2 Production Director did not produce an output.");
  }

  const cleaned = aiResult.text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error(`Failed to parse Stage 2 Production JSON.`);
    }
  }

  const rawTimeline = Array.isArray(parsed.timeline)
    ? parsed.timeline
    : Array.isArray(parsed.scenes)
    ? parsed.scenes
    : [];

  const timeline: ShortsScene[] = rawTimeline.map((s: any, idx: number) => ({
    sceneNumber: s.sceneNumber || idx + 1,
    timeRange: s.timeRange || s.timing || `${idx * 5}-${(idx + 1) * 5}s`,
    voiceover: s.voiceover || s.voiceOver || s.narration || s.spokenWords || s.dialogue || s.audio || "",
    visual: s.visual || s.visualDescription || s.shotDescription || s.scene || "",
    shotType: s.shotType || "Medium shot with dynamic zoom",
    productionMethod: s.productionMethod || "SHOOT YOURSELF",
    onScreenText: s.onScreenText,
    bRollOrAsset: s.bRollOrAsset,
    editingNote: s.editingNote || "",
    sfx: s.sfx || "",
    musicCue: s.musicCue || "",
    aiImagePrompt: s.aiImagePrompt,
    aiVideoPrompt: s.aiVideoPrompt,
  }));

  let combinedVoiceover = timeline.map((s) => s.voiceover).filter(Boolean).join(" ");
  if (!combinedVoiceover && parsed.fullVoiceover) {
    combinedVoiceover = parsed.fullVoiceover;
  }
  if (!combinedVoiceover && parsed.voiceover) {
    combinedVoiceover = parsed.voiceover;
  }

  const words = combinedVoiceover.split(/\s+/).filter(Boolean);
  const actualWordCount = words.length;

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
      voiceStyle: parsed.editing?.audioDirection?.voiceStyle || `${strategy.tone}, direct and conversational`,
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
    topic: strategy.topic,
    platform,
    strategy: {
      contentAngle: strategy.contentAngle,
      whyThisAngleWorks: strategy.whyThisAngleWorks,
      targetAudience: strategy.targetAudience,
      goal: strategy.primaryGoal,
      tone: strategy.tone,
      creatorMode,
      estimatedWords: actualWordCount || targetWords,
      pacing: `Fast & punchy (~${seconds}s)`,
    },
    research: strategy.research,
    hooks: {
      options: strategy.hooks,
      selectedHookId: strategy.selectedHookId,
      selectedHookText: strategy.selectedHookText,
      selectionRationale: strategy.selectionRationale,
    },
    script: {
      fullVoiceover: combinedVoiceover,
      wordCount: actualWordCount,
      estimatedSeconds: Math.round(actualWordCount / 2.7) || seconds,
      durationFormatted: duration,
    },
    timeline,
    editing,
    production,
  };

  const finalAiEditorPrompt = buildMasterAiEditorPrompt(partialBlueprint);

  return {
    ...partialBlueprint,
    finalAiEditorPrompt,
  };
}
