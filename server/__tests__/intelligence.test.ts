import { describe, it, expect } from "vitest";
import {
  understandTopicSemantically,
  runTitleIntelligencePipeline,
} from "../services/titleIntelligence.js";
import { generateDynamicScript } from "../services/scriptIntelligence.js";

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
  });
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
  });

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
  });
});
