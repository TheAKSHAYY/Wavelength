import { describe, it, expect } from "vitest";
import { generateImageUrl, THUMBNAIL_PRESETS } from "../imageGenerator";

describe("generateImageUrl", () => {
  it("builds valid Pollinations FLUX 16:9 thumbnail URL", () => {
    const url = generateImageUrl("Shocked developer looking at AI code", {
      width: 1280,
      height: 720,
    });

    expect(url).toContain("https://image.pollinations.ai/prompt/");
    expect(url).toContain("width=1280");
    expect(url).toContain("height=720");
    expect(url).toContain("model=flux");
    expect(url).toContain("nologo=true");
    expect(url).toContain("seed=");
  });

  it("handles custom dimensions and model types", () => {
    const url = generateImageUrl("Cartoon mascot", {
      width: 1024,
      height: 1024,
      model: "flux-3d",
    });

    expect(url).toContain("width=1024");
    expect(url).toContain("height=1024");
    expect(url).toContain("model=flux-3d");
  });

  it("provides high-CTR thumbnail mood presets", () => {
    expect(THUMBNAIL_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(THUMBNAIL_PRESETS[0]).toHaveProperty("name");
    expect(THUMBNAIL_PRESETS[0]).toHaveProperty("stylePrompt");
    expect(THUMBNAIL_PRESETS[0].stylePrompt.length).toBeGreaterThan(10);
  });

  it("encodes negativePrompt parameter properly when provided", () => {
    const url = generateImageUrl("Cosmic black hole", {
      width: 1280,
      height: 720,
      negativePrompt: "no text, no letters, no logos",
    });

    expect(url).toContain("negative=no%20text%2C%20no%20letters%2C%20no%20logos");
  });
});
