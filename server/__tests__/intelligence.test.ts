import { describe, it, expect } from "vitest";
import {
  understandTopicSemantically,
  runTitleIntelligencePipeline,
} from "../services/titleIntelligence.js";
import { generateDynamicScript } from "../services/scriptIntelligence.js";
import { runThumbnailIntelligence } from "../services/thumbnailIntelligence.js";

describe("Title Intelligence Engine", () => {
  it("extracts semantic meaning, domain, and keywords accurately", () => {
    const semantic = understandTopicSemantically("React 19 Server Actions Deep Dive");
    expect(semantic.cleanSubject.length).toBeGreaterThan(0);
    expect(semantic.domain).toBeDefined();
    expect(semantic.keywords.length).toBeGreaterThan(0);
  });

  it("runs full pipeline producing 10 psychological framework titles with scores", async () => {
    const result = await runTitleIntelligencePipeline("Next.js App Router Architecture");
    expect(result.titles.length).toBe(10);
    expect(result.titles[0]).toHaveProperty("title");
    expect(result.titles[0]).toHaveProperty("framework");
    expect(result.titles[0]).toHaveProperty("score");
    expect(result.titles[0].score).toBeGreaterThan(60);
    expect(result.opportunity.length).toBeGreaterThan(0);
  }, 30000);
});

describe("Script Assistant Engine", () => {
  it("generates structured creator script with hooks and retention sections", async () => {
    const script = await generateDynamicScript(
      "Build an AI Coding Agent in TypeScript",
      "Developers",
      "English",
      "10-15 minutes"
    );
    expect(script).toHaveProperty("hook");
    expect(script).toHaveProperty("intro");
    expect(script).toHaveProperty("sections");
    expect(script).toHaveProperty("cta");
    expect(script.sections.length).toBeGreaterThanOrEqual(3);
    expect(script.qualityScore?.overall).toBeGreaterThanOrEqual(70);
  }, 30000);

  it("generates structured scripts across different topics", async () => {
    const script = await generateDynamicScript(
      "Next.js App Router Guide",
      "Developers",
      "English",
      "8-12 minutes"
    );
    expect(script.language).toBe("English");
    expect(script.hook.length).toBeGreaterThan(10);
    expect(script.sections.length).toBeGreaterThanOrEqual(3);
  }, 30000);
});

describe("Thumbnail Intelligence Engine", () => {
  it("synthesizes high-CTR synchronized thumbnail blueprint from title and script", async () => {
    const blueprint = await runThumbnailIntelligence({
      title: "Stop Learning Java the Wrong Way in 2026",
      script: "90% of developers fail Java interviews because they memorize syntax instead of mastering DSA and system design.",
      topic: "Java Programming",
      audience: "Software Engineers",
    });

    expect(blueprint).toHaveProperty("visualHook");
    expect(blueprint).toHaveProperty("focalSubject");
    expect(blueprint).toHaveProperty("backgroundScene");
    expect(blueprint).toHaveProperty("overlayText");
    expect(blueprint).toHaveProperty("colorPalette");
    expect(blueprint).toHaveProperty("composition");
    expect(blueprint).toHaveProperty("enginePrompt");
    expect(blueprint).toHaveProperty("blueprint");
    expect(blueprint).toHaveProperty("negativePrompt");

    expect(blueprint.overlayText.length).toBeGreaterThan(0);
    // Verified: No generic "16:9 YouTube thumbnail" prompt prefix
    expect(blueprint.enginePrompt).not.toContain("16:9 YouTube thumbnail photography for");
    expect(blueprint.blueprint.visualMedium.length).toBeGreaterThan(5);
    expect(blueprint.negativePrompt).toContain("embedded text");
    expect(blueprint.colorPalette.contrastRating).toBeDefined();
    expect(blueprint.ctrOptimizationTips.length).toBeGreaterThanOrEqual(2);
  }, 15000);

  it("handles split comparison versus titles correctly", async () => {
    const blueprint = await runThumbnailIntelligence({
      title: "Next.js vs Remix: Which Should You Choose?",
      topic: "Web Development",
    });

    expect(blueprint.layout === "SPLIT_COMPARISON" || blueprint.composition.layoutType === "SPLIT_COMPARISON" || blueprint.composition.layoutType === "Split-Screen").toBe(true);
    expect(blueprint.enginePrompt.length).toBeGreaterThan(30);
  }, 15000);

  it("evaluates the 5 key test topics and derives domain-authentic visual mediums with zero generic stock templates", async () => {
    const fiveTestCases = [
      {
        topic: "Why Black Holes Are Terrifying",
        expectedMediumKeywords: ["cosmic", "deep-space", "astrophotography", "astronomical", "render", "space", "visualization", "cinematic", "digital", "3d", "photo"],
        expectedPromptKeywords: ["black hole", "event horizon", "gravitational", "accretion", "lensing", "stars", "space"],
        forbiddenInPrompt: ["16:9 youtube thumbnail", "biryani", "coding screen", "laptop"],
      },
      {
        topic: "How I Learned Java in 30 Days",
        expectedMediumKeywords: ["photography", "editorial", "technology", "developer", "visual", "cinematic", "photo", "digital", "render"],
        expectedPromptKeywords: ["java", "code", "syntax", "programming", "developer", "ide", "terminal"],
        forbiddenInPrompt: ["16:9 youtube thumbnail", "black hole", "biryani", "ancient pyramid"],
      },
      {
        topic: "I Built an AI App in 24 Hours",
        expectedMediumKeywords: ["photography", "editorial", "technology", "visualization", "visual", "cinematic", "photo", "digital", "render"],
        expectedPromptKeywords: ["ai", "app", "interface", "developer", "screen", "terminal", "deploy"],
        forbiddenInPrompt: ["16:9 youtube thumbnail", "black hole", "cooking", "gym"],
      },
      {
        topic: "Why Your Brain Loves Social Media",
        expectedMediumKeywords: ["neural", "psychological", "visualization", "3d", "render", "conceptual", "cinematic", "digital", "illustration", "photo"],
        expectedPromptKeywords: ["brain", "neural", "dopamine", "synapse", "glowing", "pathway", "phone"],
        forbiddenInPrompt: ["16:9 youtube thumbnail", "black hole", "biryani", "cricket"],
      },
      {
        topic: "GTA 6 Is Going to Change Gaming",
        expectedMediumKeywords: ["game", "render", "cinematic", "unreal engine", "engine", "digital", "3d", "art"],
        expectedPromptKeywords: ["game", "gta", "city", "neon", "action", "cinematic", "lighting"],
        forbiddenInPrompt: ["16:9 youtube thumbnail", "black hole", "biryani", "laptop coding"],
      },
    ];

    for (const testCase of fiveTestCases) {
      await new Promise((r) => setTimeout(r, 400));
      const res = await runThumbnailIntelligence({
        title: testCase.topic,
        topic: testCase.topic,
      });

      expect(res).toBeDefined();
      expect(res.blueprint).toBeDefined();
      expect(res.enginePrompt).toBeDefined();
      expect(res.negativePrompt).toBeDefined();

      const mediumLower = (res.blueprint.visualMedium || "").toLowerCase();
      const promptLower = res.enginePrompt.toLowerCase();

      // Check medium matches domain
      const mediumMatched = testCase.expectedMediumKeywords.some((kw) => mediumLower.includes(kw));
      expect(mediumMatched).toBe(true);

      // Check prompt contains key subject elements
      const promptMatched = testCase.expectedPromptKeywords.some((kw) => promptLower.includes(kw));
      expect(promptMatched).toBe(true);

      // Check forbidden artifacts are NOT present
      for (const forbidden of testCase.forbiddenInPrompt) {
        expect(promptLower).not.toContain(forbidden);
      }
    }
  }, 90000);

  it("generates distinct, topic-grounded visual concepts for all 12 cross-domain topics with zero generic templates", async () => {
    const testCases = [
      {
        title: "Java DSA Roadmap",
        expectedKeywords: ["java", "dsa", "binary tree", "data structure", "algorithm", "node"],
        forbiddenKeywords: ["fashion", "holographic sci-fi", "random female portrait", "biryani"],
      },
      {
        title: "How Black Holes Work",
        expectedKeywords: ["black hole", "accretion disk", "space", "gravitational", "lensing", "stars"],
        forbiddenKeywords: ["influencer looking at camera", "coding", "biryani", "fashion"],
      },
      {
        title: "Best Places to Visit in Japan",
        expectedKeywords: ["japan", "fuji", "cherry blossom", "travel", "pagoda", "panorama"],
        forbiddenKeywords: ["futuristic sci-fi room", "holographic interface", "coding"],
      },
      {
        title: "How to Start Freelancing",
        expectedKeywords: ["freelance", "workstation", "client", "laptop", "office", "revenue"],
        forbiddenKeywords: ["black hole", "ancient pyramid", "random female portrait"],
      },
      {
        title: "How to Build Muscle",
        expectedKeywords: ["muscle", "dumbbell", "gym", "athletic", "fitness", "lifting"],
        forbiddenKeywords: ["coding screen", "black hole", "holographic sci-fi"],
      },
      {
        title: "The History of Ancient Egypt",
        expectedKeywords: ["pyramid", "egypt", "giza", "pharaoh", "ancient", "desert", "hieroglyph"],
        forbiddenKeywords: ["laptop", "phone", "modern cars", "holographic"],
      },
      {
        title: "iPhone vs Samsung",
        expectedKeywords: ["iphone", "samsung", "phone", "split", "camera", "side-by-side"],
        forbiddenKeywords: ["biryani", "ancient pyramid", "guitar"],
      },
      {
        title: "How Bitcoin Works",
        expectedKeywords: ["bitcoin", "blockchain", "coin", "crypto", "ledger", "node"],
        forbiddenKeywords: ["fashion portrait", "biryani", "ancient pyramid"],
      },
      {
        title: "Easy Chicken Biryani Recipe",
        expectedKeywords: ["biryani", "rice", "spice", "pot", "saffron", "chicken", "culinary"],
        forbiddenKeywords: ["futuristic tech", "blue holographic", "black hole", "laptop"],
      },
      {
        title: "How to Learn Guitar",
        expectedKeywords: ["guitar", "fretboard", "chord", "instrument", "strings", "finger"],
        forbiddenKeywords: ["futuristic sci-fi", "black hole", "coding"],
      },
      {
        title: "Why Your React App Is Slow",
        expectedKeywords: ["react", "slow", "performance", "flamegraph", "monitor", "latency"],
        forbiddenKeywords: ["fashion model", "ancient pyramid", "biryani"],
      },
      {
        title: "Best Gaming PC Under $1000",
        expectedKeywords: ["gaming", "pc", "graphics card", "gpu", "case", "hardware", "build"],
        forbiddenKeywords: ["biryani", "ancient pyramid", "black hole"],
      },
    ];

    for (const tc of testCases) {
      await new Promise((r) => setTimeout(r, 50));
      const blueprint = await runThumbnailIntelligence({
        title: tc.title,
        topic: tc.title,
      });

      expect(blueprint).toBeDefined();
      expect(blueprint.focalSubject.length).toBeGreaterThan(15);
      expect(blueprint.enginePrompt.length).toBeGreaterThan(30);
      expect(blueprint.visualRelevanceScore).toBeGreaterThanOrEqual(75);

      const storyStr = typeof blueprint.visualStory === "object"
        ? `${blueprint.visualStory?.narrative || ""} ${blueprint.visualStory?.primaryFocalSubject || ""} ${(blueprint.visualStory?.secondaryElements || []).join(" ")}`
        : String(blueprint.visualStory || "");

      const positiveScene = `${blueprint.focalSubject} ${storyStr} ${blueprint.backgroundScene || ""}`.toLowerCase();
      
      // At least one expected semantic anchor must be present
      const hasSemanticAnchor = tc.expectedKeywords.some((kw) => `${positiveScene} ${blueprint.enginePrompt}`.toLowerCase().includes(kw));
      expect(hasSemanticAnchor).toBe(true);

      // Forbidden generic words must NOT be present in positive visual concept
      for (const forbidden of tc.forbiddenKeywords) {
        expect(positiveScene).not.toContain(forbidden);
      }
    }
  }, 180000);
});



