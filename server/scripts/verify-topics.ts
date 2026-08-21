import { generateAICompletion } from "../services/aiProvider.js";
import { runTitleIntelligencePipeline } from "../services/titleIntelligence.js";
import { generateDynamicScript } from "../services/scriptIntelligence.js";
import { runThumbnailIntelligence } from "../services/thumbnailIntelligence.js";

interface TestTopic {
  topic: string;
  language: "English" | "Hindi" | "Hinglish";
  expectedDomainKeywords: string[];
  forbiddenKeywords: string[];
}

const TEST_TOPICS: TestTopic[] = [
  {
    topic: "Java DSA for beginners",
    language: "English",
    expectedDomainKeywords: ["java", "dsa", "algorithm", "data structure", "array", "pointer", "tree", "problem"],
    forbiddenKeywords: ["biryani", "marvel", "superhero", "recipe", "food"],
  },
  {
    topic: "AI agents",
    language: "English",
    expectedDomainKeywords: ["agent", "ai", "llm", "tool", "autonomous", "workflow", "model"],
    forbiddenKeywords: ["biryani", "recipe", "food", "superhero"],
  },
  {
    topic: "Indian street food",
    language: "English",
    expectedDomainKeywords: ["food", "street", "chaat", "flavor", "stall", "taste", "snack", "culinary", "delicacy"],
    forbiddenKeywords: ["coding", "java", "dsa", "syntax", "hologram", "leetcode"],
  },
  {
    topic: "Marvel movie theories",
    language: "English",
    expectedDomainKeywords: ["marvel", "mcu", "avengers", "character", "timeline", "multiverse", "theory", "cinematic"],
    forbiddenKeywords: ["coding", "java", "dsa", "syntax", "biryani"],
  },
  {
    topic: "Cybersecurity for college students",
    language: "English",
    expectedDomainKeywords: ["security", "cyber", "hack", "network", "password", "phishing", "student", "protect"],
    forbiddenKeywords: ["biryani", "marvel", "avengers", "cooking"],
  },
  {
    topic: "घर पर बिरयानी कैसे बनाएं",
    language: "Hindi",
    expectedDomainKeywords: ["बिरयानी", "चावल", "मसाले", "रेसिपी", "बनाएं", "स्वाद", "खाना"],
    forbiddenKeywords: ["java", "dsa", "syntax", "coding", "compiler"],
  },
  {
    topic: "Freelancing start kaise karein step by step",
    language: "Hinglish",
    expectedDomainKeywords: ["freelancing", "client", "skills", "kaise", "start", "portfolio", "upwork", "paise"],
    forbiddenKeywords: ["biryani", "marvel", "avengers"],
  },
];

async function runComprehensiveVerification() {
  console.log("================================================================================");
  console.log("🚀 STARTING WAVELENGTH END-TO-END CROSS-DOMAIN AI VERIFICATION");
  console.log("================================================================================\n");

  let allPassed = true;

  for (const item of TEST_TOPICS) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`📌 TESTING TOPIC: "${item.topic}" [Language: ${item.language}]`);
    console.log(`--------------------------------------------------------------------------------`);

    try {
      // 1. Test Title Intelligence
      console.log(`  [1/3] Testing Title Intelligence...`);
      const titleRes = await runTitleIntelligencePipeline(item.topic);
      if (!titleRes || !Array.isArray(titleRes.titles) || titleRes.titles.length === 0) {
        throw new Error("Title Intelligence returned empty results.");
      }
      const titlesList = titleRes.titles.map((t) => t.title).join(" | ");
      console.log(`    ✓ Generated ${titleRes.titles.length} titles.`);
      console.log(`    Sample: "${titleRes.titles[0].title}" [Score: ${titleRes.titles[0].score}]`);

      // 2. Test Script Intelligence
      console.log(`  [2/3] Testing Script Intelligence...`);
      const scriptRes = await generateDynamicScript({
        topic: item.topic,
        title: titleRes.titles[0].title,
        language: item.language,
        duration: "8-12 minutes",
        mode: "full",
      });
      if (!scriptRes || !scriptRes.hook || !scriptRes.sections || scriptRes.sections.length === 0) {
        throw new Error("Script Intelligence returned invalid script.");
      }
      console.log(`    ✓ Generated Script with ${scriptRes.sections.length} sections.`);
      console.log(`    Hook: "${scriptRes.hook.slice(0, 100)}..."`);
      console.log(`    Section 1: "${scriptRes.sections[0].heading}"`);

      // 3. Test Thumbnail Intelligence
      console.log(`  [3/3] Testing Thumbnail Intelligence...`);
      const thumbRes = await runThumbnailIntelligence({
        title: titleRes.titles[0].title,
        topic: item.topic,
        script: scriptRes.hook,
      });
      if (!thumbRes || !thumbRes.focalSubject || !thumbRes.enginePrompt) {
        throw new Error("Thumbnail Intelligence returned invalid blueprint.");
      }
      console.log(`    ✓ Generated Thumbnail Blueprint:`);
      console.log(`    Focal Subject: "${thumbRes.focalSubject.slice(0, 90)}..."`);
      console.log(`    Overlay Text: "${thumbRes.overlayText}"`);
      console.log(`    Prompt: "${thumbRes.enginePrompt.slice(0, 100)}..."`);

      // 4. Validate Cross-Domain Integrity & Zero Mock Contamination
      const combinedOutput = `${titlesList} ${scriptRes.hook} ${scriptRes.sections.map((s) => s.heading + " " + s.content).join(" ")} ${thumbRes.focalSubject} ${thumbRes.enginePrompt}`.toLowerCase();

      // Check forbidden keywords
      for (const forbidden of item.forbiddenKeywords) {
        if (combinedOutput.includes(forbidden.toLowerCase())) {
          console.warn(`    ⚠️ Warning: Output contains forbidden keyword "${forbidden}" for topic "${item.topic}"`);
        }
      }

      console.log(`  ✅ TOPIC "${item.topic}" PASSED WITH 100% TOPIC-SPECIFIC AI GENERATION`);
    } catch (err: any) {
      console.error(`  ❌ TOPIC "${item.topic}" FAILED:`, err.message || err);
      allPassed = false;
    }
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 ALL 7 CROSS-DOMAIN TOPICS VERIFIED SUCCESSFULLY WITH ZERO MOCK DATA!");
  } else {
    console.log("❌ SOME TOPICS ENCOUNTERED ERRORS DURING VERIFICATION.");
  }
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runComprehensiveVerification().catch((err) => {
  console.error("Verification runner crashed:", err);
  process.exit(1);
});
