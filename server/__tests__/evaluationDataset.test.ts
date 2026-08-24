import { describe, it, expect } from "vitest";
import { evaluateShortsQuality, extractTopicKeywords } from "../services/shortsQuality.js";
import { parseTimeRange, validateTimeline } from "../services/shortsValidation.js";

/**
 * 30 Representative Prompt Test Cases across Categories, Languages, and Durations.
 */
export const EVALUATION_DATASET = [
  // Technology
  { id: "tech_1", category: "Technology", topic: "Java memory leaks in production", duration: "45s", language: "English", expectedKeywords: ["java", "memory", "leak", "heap", "garbage"] },
  { id: "tech_2", category: "Technology", topic: "Next.js Server Actions security risks", duration: "30s", language: "English", expectedKeywords: ["next", "server", "action", "security"] },
  { id: "tech_3", category: "Technology", topic: "Rust ownership and borrow checker explained", duration: "60s", language: "English", expectedKeywords: ["rust", "ownership", "borrow", "memory"] },
  { id: "tech_4", category: "Technology", topic: "Kubernetes pod eviction reasons", duration: "45s", language: "English", expectedKeywords: ["kubernetes", "pod", "eviction", "node"] },

  // Science
  { id: "sci_1", category: "Science", topic: "How does a black hole bend spacetime?", duration: "45s", language: "English", expectedKeywords: ["black", "hole", "gravity", "spacetime", "singularity"] },
  { id: "sci_2", category: "Science", topic: "How photosynthesis generates oxygen in leaves", duration: "30s", language: "English", expectedKeywords: ["photosynthesis", "oxygen", "plant", "sunlight", "chlorophyll"] },
  { id: "sci_3", category: "Science", topic: "CRISPR Cas9 gene editing mechanism", duration: "60s", language: "English", expectedKeywords: ["crispr", "cas9", "gene", "dna", "editing"] },
  { id: "sci_4", category: "Science", topic: "Quantum superposition Schrödinger cat", duration: "45s", language: "English", expectedKeywords: ["quantum", "superposition", "state", "physics"] },

  // Education / Student
  { id: "edu_1", category: "Education", topic: "Why BCA students struggle with tech internships", duration: "45s", language: "Hinglish", expectedKeywords: ["bca", "internship", "project", "resume", "skills"] },
  { id: "edu_2", category: "Education", topic: "Active recall study technique vs re-reading", duration: "30s", language: "English", expectedKeywords: ["active", "recall", "study", "memory", "retention"] },
  { id: "edu_3", category: "Education", topic: "How to crack system design interviews without experience", duration: "60s", language: "English", expectedKeywords: ["system", "design", "interview", "architecture"] },
  { id: "edu_4", category: "Education", topic: "Coding interview preparation roadmap in Hindi", duration: "45s", language: "Hindi", expectedKeywords: ["coding", "interview", "career"] },

  // History
  { id: "hist_1", category: "History", topic: "The Roman concrete engineering secret", duration: "45s", language: "English", expectedKeywords: ["roman", "concrete", "engineering", "volcanic", "ash"] },
  { id: "hist_2", category: "History", topic: "The real reason the Library of Alexandria was destroyed", duration: "60s", language: "English", expectedKeywords: ["alexandria", "library", "scrolls", "history", "caesar"] },
  { id: "hist_3", category: "History", topic: "Apollo 11 guidance computer memory capacity", duration: "30s", language: "English", expectedKeywords: ["apollo", "guidance", "computer", "memory", "moon"] },
  { id: "hist_4", category: "History", topic: "Indus Valley Civilization urban drainage system", duration: "45s", language: "English", expectedKeywords: ["indus", "valley", "drainage", "harappa", "city"] },

  // Finance
  { id: "fin_1", category: "Finance", topic: "Why Bitcoin is volatile during halving cycles", duration: "45s", language: "English", expectedKeywords: ["bitcoin", "volatile", "halving", "crypto", "supply"] },
  { id: "fin_2", category: "Finance", topic: "Index funds vs stock picking compound interest", duration: "30s", language: "English", expectedKeywords: ["index", "fund", "stock", "compound", "invest"] },
  { id: "fin_3", category: "Finance", topic: "How inflation secretly devalues cash savings", duration: "45s", language: "English", expectedKeywords: ["inflation", "cash", "purchasing", "money"] },
  { id: "fin_4", category: "Finance", topic: "Mutual funds portfolio diversification guide in Hinglish", duration: "30s", language: "Hinglish", expectedKeywords: ["mutual", "fund", "portfolio", "sip", "invest"] },

  // Gaming
  { id: "game_1", category: "Gaming", topic: "Why speedrunners use subpixel physics in Super Mario 64", duration: "45s", language: "English", expectedKeywords: ["speedrun", "mario", "subpixel", "physics", "glitch"] },
  { id: "game_2", category: "Gaming", topic: "How Minecraft generates infinite procedural worlds", duration: "30s", language: "English", expectedKeywords: ["minecraft", "procedural", "seed", "chunk", "world"] },
  { id: "game_3", category: "Gaming", topic: "Unreal Engine 5 Nanite geometry rendering explained", duration: "60s", language: "English", expectedKeywords: ["unreal", "nanite", "geometry", "polygon", "render"] },
  { id: "game_4", category: "Gaming", topic: "Elden Ring boss AI input reading breakdown", duration: "45s", language: "English", expectedKeywords: ["elden", "ring", "boss", "input", "reading"] },

  // Entertainment & Film
  { id: "ent_1", category: "Entertainment", topic: "How Christopher Nolan shoots practical effects in IMAX", duration: "45s", language: "English", expectedKeywords: ["nolan", "practical", "effects", "imax", "camera"] },
  { id: "ent_2", category: "Entertainment", topic: "Pixar 22 rules of storytelling structure", duration: "30s", language: "English", expectedKeywords: ["pixar", "story", "character", "structure"] },
  { id: "ent_3", category: "Entertainment", topic: "How movie foley artists record monster sound effects", duration: "45s", language: "English", expectedKeywords: ["foley", "sound", "effects", "audio", "artist"] },
  { id: "ent_4", category: "Entertainment", topic: "The color psychology of Dune cinematography", duration: "30s", language: "English", expectedKeywords: ["dune", "color", "cinematography", "visual", "lighting"] },

  // Multilingual Diversity
  { id: "multi_1", category: "Education", topic: "Roz subah jaldi uthne ke scientific psychological tips", duration: "30s", language: "Hinglish", expectedKeywords: ["subah", "habits", "sleep", "routine"] },
  { id: "multi_2", category: "Finance", topic: "शेयर बाजार में पहली बार निवेश कैसे करें", duration: "45s", language: "Hindi", expectedKeywords: ["शेयर", "निवेश", "बाजार"] },
];

describe("AI Quality Evaluation Dataset & Regression Suite", () => {
  it("contains 30 representative evaluation prompts covering 7+ distinct domains", () => {
    expect(EVALUATION_DATASET.length).toBe(30);

    const categories = new Set(EVALUATION_DATASET.map((d) => d.category));
    expect(categories.has("Technology")).toBe(true);
    expect(categories.has("Science")).toBe(true);
    expect(categories.has("Education")).toBe(true);
    expect(categories.has("History")).toBe(true);
    expect(categories.has("Finance")).toBe(true);
    expect(categories.has("Gaming")).toBe(true);
    expect(categories.has("Entertainment")).toBe(true);

    const languages = new Set(EVALUATION_DATASET.map((d) => d.language));
    expect(languages.has("English")).toBe(true);
    expect(languages.has("Hindi")).toBe(true);
    expect(languages.has("Hinglish")).toBe(true);
  });

  it("verifies topic keyword extraction across all 30 benchmark prompts", () => {
    for (const item of EVALUATION_DATASET) {
      const keywords = extractTopicKeywords(item.topic);
      expect(keywords.length).toBeGreaterThanOrEqual(1);

      // Verify at least one expected keyword is extracted cleanly
      const hasMatch = item.expectedKeywords.some((kw) =>
        keywords.some((extracted) => extracted.includes(kw) || kw.includes(extracted))
      );
      expect(hasMatch).toBe(true);
    }
  });

  it("evaluates simulated high-quality scripts across dataset items with zero cliches", () => {
    for (const item of EVALUATION_DATASET.slice(0, 10)) {
      const simulatedScript =
        item.language === "Hindi"
          ? `अगर आप ${item.topic} को अच्छी तरह से समझना चाहते हैं तो इन 3 ज़रूरी बातों को ध्यान से देखें। यह नियम आपको सही परिणाम हासिल करने में पूरी मदद करेंगे।`
          : item.language === "Hinglish"
          ? `Agar aap ${item.topic} samajhna chahte ho, toh yeh 3 key rules bilkul miss mat karna. Yeh practical breakdown aapko real world clarity dega.`
          : `Here is the real breakdown of ${item.topic}. The core mechanism relies on 3 key factors that deliver reliable results when implemented properly in practice.`;

      const qa = evaluateShortsQuality(simulatedScript, 35, 15, {
        topic: item.topic,
        language: item.language as any,
      });

      expect(qa.humanTestPassed).toBe(true);
      expect(qa.detectedCliches).toBeUndefined();
      expect(qa.specificityScore).toBeGreaterThanOrEqual(70);
    }
  });
});
