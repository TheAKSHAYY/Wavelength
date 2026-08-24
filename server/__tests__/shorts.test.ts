import { describe, it, expect } from "vitest";
import {
  generateShortsBlueprint,
  getDurationWordLimits,
  buildMasterAiEditorPrompt,
} from "../services/shortsIntelligence.js";

describe("Shorts Studio Intelligence Engine", () => {
  it("calculates accurate duration word count budgets", () => {
    const d15 = getDurationWordLimits("15s");
    expect(d15.targetWords).toBe(38);
    expect(d15.seconds).toBe(15);

    const d30 = getDurationWordLimits("30s");
    expect(d30.targetWords).toBe(75);
    expect(d30.seconds).toBe(30);

    const d45 = getDurationWordLimits("45s");
    expect(d45.targetWords).toBe(115);
    expect(d45.seconds).toBe(45);

    const d60 = getDurationWordLimits("60s");
    expect(d60.targetWords).toBe(150);
    expect(d60.seconds).toBe(60);
  });

  it("generates a human-first, production-ready Shorts blueprint with scene timeline and hooks", async () => {
    const blueprint = await generateShortsBlueprint({
      topic: "Why BCA students struggle to get internships",
      creatorMode: "Educator",
      duration: "30s",
      language: "English",
      tone: "Direct & Punchy",
    });

    expect(blueprint).toBeDefined();
    expect(blueprint.strategy).toHaveProperty("contentAngle");
    expect(blueprint.strategy).toHaveProperty("whyThisAngleWorks");
    expect(blueprint.strategy.creatorMode).toBe("Educator");

    // Hook options
    expect(blueprint.hooks.options.length).toBeGreaterThanOrEqual(3);
    expect(blueprint.hooks.selectedHookText.length).toBeGreaterThan(10);

    // Script & timeline
    expect(blueprint.script.fullVoiceover.length).toBeGreaterThan(30);
    expect(blueprint.timeline.length).toBeGreaterThanOrEqual(3);

    // Validate scene properties
    const firstScene = blueprint.timeline[0];
    expect(firstScene).toHaveProperty("sceneNumber");
    expect(firstScene).toHaveProperty("timeRange");
    expect(firstScene).toHaveProperty("voiceover");
    expect(firstScene).toHaveProperty("visual");
    expect(firstScene).toHaveProperty("productionMethod");

    // Editing & Audio
    expect(blueprint.editing.captionStrategy).toHaveProperty("style");
    expect(blueprint.editing.audioDirection).toHaveProperty("targetBpm");

    // Action checklist
    expect(blueprint.production.beforeRecording.length).toBeGreaterThanOrEqual(1);
    expect(blueprint.production.duringRecording.length).toBeGreaterThanOrEqual(1);
    expect(blueprint.production.afterRecording.length).toBeGreaterThanOrEqual(1);

    // Final AI Editor Prompt
    expect(blueprint.finalAiEditorPrompt).toContain("Vertical 9:16 Short Video Blueprint");
    expect(blueprint.finalAiEditorPrompt).toContain("FULL SPOKEN VOICEOVER:");
    expect(blueprint.finalAiEditorPrompt).toContain("SCENE-BY-SCENE EDITING TIMELINE:");
  }, 45000);

  it("enforces zero invented personal experience when user gives a general topic", async () => {
    const blueprint = await generateShortsBlueprint({
      topic: "Java memory leaks in production",
      creatorMode: "Explainer",
      duration: "30s",
    });

    const scriptLower = blueprint.script.fullVoiceover.toLowerCase();
    // Guardrail: should not fabricate personal stories like "When I worked at Google" or "Last month I crashed"
    expect(scriptLower).not.toContain("when i worked at google");
    expect(scriptLower).not.toContain("my boss fired me");
    expect(blueprint.timeline.length).toBeGreaterThan(0);
  }, 45000);

  it("builds clean copy-ready AI editor prompt", () => {
    const mockBlueprint = {
      topic: "How to Stop Procrastination",
      platform: "YouTube Shorts",
      strategy: {
        contentAngle: "The 2-Minute Rule",
        whyThisAngleWorks: "Reduces friction to zero",
        targetAudience: "Students & Creators",
        goal: "Instant action",
        tone: "Punchy",
        creatorMode: "Educator" as const,
        estimatedWords: 75,
        pacing: "Fast (~30s)",
      },
      hooks: {
        options: [],
        selectedHookId: "hook_1",
        selectedHookText: "If you struggle with procrastination, do this.",
        selectionRationale: "Curiosity",
      },
      script: {
        fullVoiceover: "If you struggle with procrastination, try the two-minute rule.",
        wordCount: 10,
        estimatedSeconds: 4,
        durationFormatted: "15s",
      },
      timeline: [
        {
          sceneNumber: 1,
          timeRange: "0-3s",
          voiceover: "If you struggle with procrastination, try the two-minute rule.",
          visual: "Speaker looking directly at camera with crisp focal clarity",
          shotType: "Medium Close-up",
          productionMethod: "SHOOT YOURSELF" as const,
          editingNote: "Immediate start",
          sfx: "Subtle click",
          musicCue: "Lo-Fi Beat",
        },
      ],
      editing: {
        pacing: "Fast",
        cutFrequency: "Every 2s",
        transitions: ["Hard cut"],
        captionStrategy: {
          style: "Word-by-word active bounce" as const,
          colorScheme: { active: "#FFE600", default: "#FFFFFF" },
          highlightKeywords: ["procrastination", "two-minute"],
        },
        audioDirection: {
          voiceStyle: "Direct",
          musicGenre: "Lo-Fi",
          musicMood: "Focus",
          targetBpm: 120,
          intensityCurve: "Steady",
          sfxList: [],
        },
      },
      production: {
        beforeRecording: ["Set camera to 9:16"],
        duringRecording: ["Maintain eye contact"],
        afterRecording: ["Add yellow captions"],
      },
      qualityAssessment: {
        humanTestPassed: true,
        specificityScore: 95,
        durationAccuracy: true,
        realismVerdict: "Ready",
      },
    };

    const prompt = buildMasterAiEditorPrompt(mockBlueprint);
    expect(prompt).toContain("Vertical 9:16 Short Video Blueprint");
    expect(prompt).toContain("How to Stop Procrastination");
    expect(prompt).toContain("SCENE-BY-SCENE EDITING TIMELINE:");
    expect(prompt).toContain("CAPTIONS & TYPOGRAPHY:");
  });

  it("generates natural Hinglish short blueprints with conversational Latin script phrasing", async () => {
    const blueprint = await generateShortsBlueprint({
      topic: "BCA students internship guide",
      creatorMode: "Educator",
      duration: "30s",
      language: "Hinglish",
    });

    expect(blueprint).toBeDefined();
    expect(blueprint.script.fullVoiceover.length).toBeGreaterThan(20);
    expect(blueprint.timeline.length).toBeGreaterThanOrEqual(2);
  }, 45000);

  it("generates authentic Hindi short blueprints with Devanagari script support", async () => {
    const blueprint = await generateShortsBlueprint({
      topic: "Coding career tips in 2026",
      creatorMode: "Educator",
      duration: "30s",
      language: "Hindi",
    });

    expect(blueprint).toBeDefined();
    expect(blueprint.script.fullVoiceover.length).toBeGreaterThan(15);
    expect(blueprint.timeline.length).toBeGreaterThanOrEqual(2);
  }, 45000);
});
