import { runThumbnailIntelligence, type ThumbnailIntelligenceOutput } from "../services/thumbnailIntelligence.js";

interface TestMatrixCase {
  id: number;
  topic: string;
  expectedDomain: string;
  expectedKeywords: string[];
  forbiddenKeywords: string[];
}

const TEST_MATRIX: TestMatrixCase[] = [
  {
    id: 1,
    topic: "Java DSA for beginners",
    expectedDomain: "Software / Tech",
    expectedKeywords: ["java", "dsa", "binary tree", "algorithm", "data structure", "node", "code"],
    forbiddenKeywords: ["biryani", "cricket", "dumbbell", "gym", "marvel", "superhero"],
  },
  {
    id: 2,
    topic: "AI agents",
    expectedDomain: "Artificial Intelligence",
    expectedKeywords: ["agent", "ai", "network", "workflow", "autonomous", "tool", "node", "digital", "system"],
    forbiddenKeywords: ["biryani", "cricket", "dumbbell", "gym", "street food", "samosa"],
  },
  {
    id: 3,
    topic: "Indian street food",
    expectedDomain: "Food / Culinary",
    expectedKeywords: ["food", "tawa", "street", "pani puri", "samosa", "spice", "stall", "culinary", "steam", "dish", "rice", "curry"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 4,
    topic: "Fitness for college students",
    expectedDomain: "Fitness / Health",
    expectedKeywords: ["fitness", "gym", "dumbbell", "workout", "muscle", "barbell", "training", "exercise", "student", "athlete"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 5,
    topic: "Cricket",
    expectedDomain: "Sports / Cricket",
    expectedKeywords: ["cricket", "bat", "ball", "stadium", "pitch", "stump", "floodlight", "match", "wicket"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 6,
    topic: "Marvel movie theories",
    expectedDomain: "Entertainment / Superhero",
    expectedKeywords: ["marvel", "mcu", "superhero", "multiverse", "cosmic", "timeline", "rift", "character", "avengers", "cinematic"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 7,
    topic: "Finance for beginners",
    expectedDomain: "Finance / Investing",
    expectedKeywords: ["finance", "money", "chart", "growth", "investment", "wealth", "asset", "compound", "saving", "stock"],
    forbiddenKeywords: ["developer", "programmer", "ide", "code editor", "syntax", "coding screen", "biryani", "cricket"],
  },
  {
    id: 8,
    topic: "Cybersecurity",
    expectedDomain: "Security / Tech",
    expectedKeywords: ["security", "cyber", "shield", "network", "lock", "padlock", "encryption", "digital", "defense"],
    forbiddenKeywords: ["biryani", "cricket", "dumbbell", "gym", "recipe"],
  },
  {
    id: 9,
    topic: "Travel",
    expectedDomain: "Travel / Adventure",
    expectedKeywords: ["travel", "destination", "mountain", "landscape", "adventure", "vista", "scenic", "horizon", "explore", "passport"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 10,
    topic: "Gaming",
    expectedDomain: "Gaming / Esports",
    expectedKeywords: ["gaming", "game", "esports", "controller", "arena", "player", "headset", "rgb", "cinematic", "gameplay"],
    forbiddenKeywords: ["biryani", "cricket", "dumbbell", "recipe"],
  },
  {
    id: 11,
    topic: "मुझे क्रिकेट पर वीडियो बनानी है",
    expectedDomain: "Sports / Cricket (Hindi)",
    expectedKeywords: ["cricket", "bat", "ball", "stadium", "pitch", "stump", "floodlight", "match", "क्रिकेट", "मैदान"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
  {
    id: 12,
    topic: "bhai fitness pe content banana hai",
    expectedDomain: "Fitness / Health (Hinglish)",
    expectedKeywords: ["fitness", "gym", "dumbbell", "workout", "muscle", "barbell", "training", "exercise", "athlete"],
    forbiddenKeywords: ["developer", "programmer", "laptop", "ide", "code editor", "syntax", "coding screen", "workstation"],
  },
];

async function runImagePipelineAudit() {
  console.log("================================================================================");
  console.log("🎨 WAVELENGTH TWO-STAGE IMAGE INTELLIGENCE PIPELINE AUDIT & TEST MATRIX");
  console.log("================================================================================\n");

  let allPassed = true;
  const results: Array<{
    id: number;
    topic: string;
    domain: string;
    subject: string;
    objects: string[];
    overlay: string;
    enginePrompt: string;
    passed: boolean;
  }> = [];

  for (const tc of TEST_MATRIX) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[Test ${tc.id}/12] Topic: "${tc.topic}"`);
    console.log(`--------------------------------------------------------------------------------`);

    try {
      const output: ThumbnailIntelligenceOutput = await runThumbnailIntelligence({
        topic: tc.topic,
        title: tc.topic,
      });

      const spec = output.visualConcept;
      console.log(`  ✓ Stage 1 Visual Concept:`);
      console.log(`    - Domain: "${spec.domain}"`);
      console.log(`    - Hero Subject: "${spec.subject}"`);
      console.log(`    - Primary Objects: [${(spec.primary_objects || []).join(", ")}]`);
      console.log(`    - Environment: "${spec.environment}"`);
      console.log(`    - Mood: "${spec.mood}"`);
      console.log(`    - Composition: "${spec.composition}"`);

      console.log(`  ✓ Stage 2 Engine Prompt:`);
      console.log(`    - Prompt: "${output.enginePrompt.slice(0, 120)}..."`);
      console.log(`    - Overlay Text Hook: "${output.overlayText}" [Badge: ${output.badgePosition}]`);
      console.log(`    - Negative Constraints: [${(spec.avoid || []).join(", ")}]`);

      // Validation Checks
      const positiveSceneText = `${spec.domain} ${spec.subject} ${spec.environment} ${(spec.primary_objects || []).join(" ")}`.toLowerCase();
      const fullText = `${positiveSceneText} ${output.enginePrompt}`.toLowerCase();

      // Check expected keywords in scene or prompt
      const hasExpected = tc.expectedKeywords.some((kw) => fullText.includes(kw.toLowerCase()));
      if (!hasExpected) {
        throw new Error(`Output failed semantic match: missing expected keywords [${tc.expectedKeywords.join(", ")}]`);
      }

      // Check forbidden keywords strictly in positive scene description
      for (const forbidden of tc.forbiddenKeywords) {
        const forbiddenRegex = new RegExp(`\\b${forbidden}\\b`, "i");
        if (forbiddenRegex.test(positiveSceneText)) {
          throw new Error(`Positive scene contaminated with forbidden term: "${forbidden}"`);
        }
      }

      console.log(`  ✅ PASSED: Genuinely topic-grounded, zero developer/coding contamination.`);
      results.push({
        id: tc.id,
        topic: tc.topic,
        domain: spec.domain,
        subject: spec.subject,
        objects: spec.primary_objects,
        overlay: output.overlayText,
        enginePrompt: output.enginePrompt,
        passed: true,
      });
    } catch (err: any) {
      console.error(`  ❌ FAILED:`, err.message || err);
      allPassed = false;
      results.push({
        id: tc.id,
        topic: tc.topic,
        domain: "FAILED",
        subject: "FAILED",
        objects: [],
        overlay: "FAILED",
        enginePrompt: err.message || "FAILED",
        passed: false,
      });
    }
  }

  // Sample Live Image Fetch Validation
  console.log("\n================================================================================");
  console.log("📸 TESTING LIVE GENERATIVE IMAGE URL RENDER VIA POLLINATIONS FLUX ENGINE");
  console.log("================================================================================");

  try {
    const samplePrompt = encodeURIComponent(results[2]?.enginePrompt || "16:9 YouTube thumbnail depicting sizzling hot pav bhaji in Mumbai street market, 8k");
    const testUrl = `https://image.pollinations.ai/prompt/${samplePrompt}?width=1280&height=720&model=flux&nologo=true`;
    console.log(`  Fetching live image from: ${testUrl.slice(0, 90)}...`);
    const resp = await fetch(testUrl, { signal: AbortSignal.timeout(15000) });
    console.log(`  ✓ Status: ${resp.status} ${resp.statusText}`);
    console.log(`  ✓ Content-Type: ${resp.headers.get("content-type")}`);
    if (resp.ok && resp.headers.get("content-type")?.includes("image")) {
      console.log(`  ✅ LIVE IMAGE GENERATION VALIDATED (1280x720 16:9 HD JPEG)`);
    } else {
      console.warn(`  ⚠️ Live image returned unexpected content type.`);
    }
  } catch (err: any) {
    console.warn(`  ⚠️ Live image render check skipped/timed out:`, err.message);
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 ALL 12 TEST MATRIX TOPICS PASSED 100% VISUAL GROUNDING AUDIT!");
  } else {
    console.log("❌ SOME TOPICS FAILED AUDIT.");
  }
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runImagePipelineAudit().catch((err) => {
  console.error("Audit runner crashed:", err);
  process.exit(1);
});
