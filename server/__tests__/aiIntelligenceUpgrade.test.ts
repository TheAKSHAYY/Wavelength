import { describe, it, expect } from "vitest";
import { generateShortsBlueprint } from "../services/shortsIntelligence.js";
import { generateShortsStrategy } from "../services/shortsStrategy.js";
import { generateShortsProduction } from "../services/shortsProduction.js";
import { evaluateShortsQuality, extractTopicKeywords } from "../services/shortsQuality.js";
import { validateTimeline, parseTimeRange, validateStage1Strategy } from "../services/shortsValidation.js";
import { repairShortsBlueprint } from "../services/shortsRepair.js";

describe("Two-Stage Shorts Intelligence Pipeline", () => {
  it("executes Stage 1 Content Strategist with topic-isolated keywords and hooks", async () => {
    const strategy = await generateShortsStrategy({
      topic: "How does photosynthesis work?",
      duration: "45s",
      language: "English",
      tone: "Direct & Punchy",
      creatorMode: "Educator",
    });

    expect(strategy).toBeDefined();
    expect(strategy.topic).toBe("How does photosynthesis work?");
    expect(strategy.coreConcept.length).toBeGreaterThan(10);
    expect(strategy.hooks.length).toBeGreaterThanOrEqual(1);
    expect(strategy.selectedHookText.length).toBeGreaterThan(5);

    // Topic isolation: should relate to biology/chlorophyll/sunlight, NOT coding/software
    const combinedStrategyText = `${strategy.coreConcept} ${strategy.contentAngle} ${strategy.keyPoints.join(" ")}`.toLowerCase();
    const hasBiologyAnchors = /plant|sunlight|chlorophyll|light|leaf|carbon|sugar|glucose|energy|oxygen/i.test(combinedStrategyText);
    expect(hasBiologyAnchors).toBe(true);

    const hasContamination = /\b(javascript|python|coding|api|react|database|css|sql)\b/i.test(combinedStrategyText);
    expect(hasContamination).toBe(false);
  }, 25000);

  it("executes Stage 2 Shorts Production Director using Stage 1 strategy", async () => {
    const strategy = await generateShortsStrategy({
      topic: "Why is Bitcoin volatile?",
      duration: "30s",
      language: "English",
      tone: "Direct & Punchy",
      creatorMode: "Explainer",
    });

    const production = await generateShortsProduction(
      { topic: "Why is Bitcoin volatile?", duration: "30s" },
      strategy
    );

    expect(production).toBeDefined();
    expect(production.timeline.length).toBeGreaterThanOrEqual(2);
    expect(production.script.fullVoiceover.length).toBeGreaterThan(20);
    expect(production.finalAiEditorPrompt).toContain("Vertical 9:16 Short Video Blueprint");

    const fullText = production.script.fullVoiceover.toLowerCase();
    const hasFinanceAnchors = /bitcoin|crypto|market|liquidity|price|supply|volatile|volatility|trade|trader/i.test(fullText);
    expect(hasFinanceAnchors).toBe(true);
  }, 35000);

  it("verifies topic isolation between two consecutive distinct topics", async () => {
    const topicA = "How does a black hole bend spacetime?";
    const topicB = "How to brew specialty pour-over coffee";

    const [stratA, stratB] = await Promise.all([
      generateShortsStrategy({ topic: topicA, duration: "30s", language: "English" }),
      generateShortsStrategy({ topic: topicB, duration: "30s", language: "English" }),
    ]);

    const textA = `${stratA.coreConcept} ${stratA.selectedHookText}`.toLowerCase();
    const textB = `${stratB.coreConcept} ${stratB.selectedHookText}`.toLowerCase();

    // A contains space physics
    expect(/black hole|gravity|spacetime|singularity|light/i.test(textA)).toBe(true);
    expect(/coffee|grind|water|beans|filter|brew/i.test(textA)).toBe(false);

    // B contains coffee terms
    expect(/coffee|grind|water|beans|filter|brew|extraction|pour/i.test(textB)).toBe(true);
    expect(/black hole|spacetime|singularity|gravity/i.test(textB)).toBe(false);
  }, 35000);
});

describe("Timeline & Schema Validation Utilities", () => {
  it("parses diverse time range strings correctly", () => {
    expect(parseTimeRange("0-3s")).toEqual({ start: 0, end: 3, duration: 3 });
    expect(parseTimeRange("3-12s")).toEqual({ start: 3, end: 12, duration: 9 });
    expect(parseTimeRange("0:15 - 0:30")).toEqual({ start: 15, end: 30, duration: 15 });
  });

  it("validates compliant timelines without error", () => {
    const scenes = [
      { sceneNumber: 1, timeRange: "0-3s", voiceover: "Hook line", visual: "Speaker close up", shotType: "Close-up", productionMethod: "SHOOT YOURSELF" as const, editingNote: "", sfx: "", musicCue: "" },
      { sceneNumber: 2, timeRange: "3-15s", voiceover: "Core explanation", visual: "Graphic diagram", shotType: "Medium", productionMethod: "MOTION GRAPHIC" as const, editingNote: "", sfx: "", musicCue: "" },
      { sceneNumber: 3, timeRange: "15-30s", voiceover: "Actionable fix and CTA", visual: "Screen record", shotType: "Over-the-shoulder", productionMethod: "SCREEN RECORD" as const, editingNote: "", sfx: "", musicCue: "" },
    ];

    const result = validateTimeline(scenes, "30s");
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.totalCalculatedSeconds).toBe(30);
  });

  it("flags overlapping and empty scenes in timeline validation", () => {
    const faultyScenes = [
      { sceneNumber: 1, timeRange: "0-10s", voiceover: "", visual: "Visual 1", shotType: "Close-up", productionMethod: "SHOOT YOURSELF" as const, editingNote: "", sfx: "", musicCue: "" },
      { sceneNumber: 2, timeRange: "5-15s", voiceover: "Overlap scene", visual: "", shotType: "Medium", productionMethod: "B-ROLL" as const, editingNote: "", sfx: "", musicCue: "" },
    ];

    const result = validateTimeline(faultyScenes, "30s");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("overlaps"))).toBe(true);
    expect(result.issues.some((i) => i.includes("missing voiceover"))).toBe(true);
    expect(result.issues.some((i) => i.includes("missing visual"))).toBe(true);
  });

  it("validates Stage 1 strategy schema", () => {
    expect(validateStage1Strategy(null).valid).toBe(false);
    expect(validateStage1Strategy({}).valid).toBe(false);
    expect(validateStage1Strategy({
      coreConcept: "Black holes warp spacetime infinitely",
      contentAngle: "Scientific Mechanism",
      hooks: [{ id: "h1", hookText: "What happens if you fall into a black hole?" }],
    }).valid).toBe(true);
  });
});

describe("Deterministic QA Engine Enhancements", () => {
  it("detects and flags banned AI cliches", () => {
    const textWithCliche = "In today's fast-paced world, this game changer will unlock your potential.";
    const qa = evaluateShortsQuality(textWithCliche, 30, 15);
    expect(qa.humanTestPassed).toBe(false);
    expect(qa.detectedCliches).toBeDefined();
    expect(qa.detectedCliches?.length).toBeGreaterThanOrEqual(2);
    expect(qa.issues.some((i) => i.type === "CLICHE")).toBe(true);
  });

  it("detects topic drift when script is unrelated to requested topic", () => {
    const topic = "How photosynthesis generates oxygen in plants";
    const driftedScript = "To configure a PostgreSQL database cluster on Kubernetes, use Helm charts.";
    const qa = evaluateShortsQuality(driftedScript, 40, 15, { topic });

    expect(qa.issues.some((i) => i.type === "TOPIC_DRIFT")).toBe(true);
  });

  it("detects repeated scene voiceovers", () => {
    const scenes = [
      { sceneNumber: 1, timeRange: "0-5s", voiceover: "This is the exact same voiceover text that repeats across scenes.", visual: "V1", shotType: "CU", productionMethod: "SHOOT YOURSELF" as const, editingNote: "", sfx: "", musicCue: "" },
      { sceneNumber: 2, timeRange: "5-10s", voiceover: "This is the exact same voiceover text that repeats across scenes.", visual: "V2", shotType: "CU", productionMethod: "SHOOT YOURSELF" as const, editingNote: "", sfx: "", musicCue: "" },
    ];

    const qa = evaluateShortsQuality(scenes[0].voiceover, 30, 15, { scenes });
    expect(qa.issues.some((i) => i.type === "REPETITION")).toBe(true);
  });

  it("extracts clean topic keywords without stopwords", () => {
    const keywords = extractTopicKeywords("How to build a scalable microservice in 2026 for beginners");
    expect(keywords).toContain("build");
    expect(keywords).toContain("scalable");
    expect(keywords).toContain("microservice");
    expect(keywords).toContain("beginners");
    expect(keywords).not.toContain("how");
    expect(keywords).not.toContain("to");
  });
});
