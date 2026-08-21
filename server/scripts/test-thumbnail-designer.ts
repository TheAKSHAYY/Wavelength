import { runThumbnailIntelligence, type ThumbnailIntelligenceOutput } from "../services/thumbnailIntelligence.js";

interface DesignerTestCase {
  id: number;
  title: string;
  topic: string;
  expectedObjective: string[];
  expectedKeywordsInSubject: string[];
  forbiddenInSubject: string[];
}

const DESIGNER_TEST_MATRIX: DesignerTestCase[] = [
  {
    id: 1,
    title: "Why Most Students Fail at DSA",
    topic: "Computer Science Education",
    expectedObjective: ["Warning", "Explanation", "Curiosity"],
    expectedKeywordsInSubject: ["tree", "graph", "algorithm", "dsa", "code", "binary", "structure", "student", "concept"],
    forbiddenInSubject: ["biryani", "cricket", "gym", "underground bunker"],
  },
  {
    id: 2,
    title: "AI Agents Explained for Beginners",
    topic: "Artificial Intelligence",
    expectedObjective: ["Explanation", "Discovery", "Curiosity"],
    expectedKeywordsInSubject: ["agent", "ai", "network", "workflow", "brain", "core", "autonomous", "system"],
    forbiddenInSubject: ["biryani", "cricket", "gym", "underground bunker"],
  },
  {
    id: 3,
    title: "7 Indian Street Foods You Need to Try",
    topic: "Indian Street Food",
    expectedObjective: ["List", "Curiosity", "Discovery"],
    expectedKeywordsInSubject: ["food", "tawa", "pani puri", "samosa", "street", "culinary", "spices", "stall"],
    forbiddenInSubject: ["developer", "programmer", "laptop", "ide", "workstation", "underground bunker"],
  },
  {
    id: 4,
    title: "Why Most People Quit the Gym",
    topic: "Fitness & Motivation",
    expectedObjective: ["Warning", "Explanation", "Curiosity", "Emotional"],
    expectedKeywordsInSubject: ["gym", "barbell", "dumbbell", "athlete", "empty", "tired", "workout", "weights", "locker"],
    forbiddenInSubject: ["developer", "programmer", "laptop", "ide", "workstation", "underground bunker"],
  },
  {
    id: 5,
    title: "India's Most Underrated Cricket Stadiums",
    topic: "Cricket & Sports Travel",
    expectedObjective: ["Discovery", "List", "Curiosity"],
    expectedKeywordsInSubject: ["stadium", "cricket", "pitch", "mountains", "scenic", "stands", "floodlights", "grass"],
    forbiddenInSubject: ["developer", "programmer", "laptop", "ide", "workstation", "underground bunker"],
  },
  {
    id: 6,
    title: "AI Agents vs Chatbots",
    topic: "AI Technology Comparison",
    expectedObjective: ["Comparison", "Explanation"],
    expectedKeywordsInSubject: ["agent", "chatbot", "vs", "autonomous", "workflow", "chat", "split", "comparison"],
    forbiddenInSubject: ["biryani", "cricket", "gym", "underground bunker"],
  },
  {
    id: 7,
    title: "Marvel Movie Theories That Actually Make Sense",
    topic: "Entertainment & Film Theories",
    expectedObjective: ["Mystery", "Curiosity", "Discovery"],
    expectedKeywordsInSubject: ["marvel", "superhero", "multiverse", "rift", "timeline", "cosmic", "character", "avengers"],
    forbiddenInSubject: ["developer", "programmer", "laptop", "ide", "workstation", "underground bunker"],
  },
  {
    id: 8,
    title: "How to Save Money as a College Student",
    topic: "Personal Finance",
    expectedObjective: ["Explanation", "Transformation", "Result"],
    expectedKeywordsInSubject: ["money", "wallet", "jar", "coins", "budget", "piggy", "cash", "growth", "student"],
    forbiddenInSubject: ["developer", "programmer", "ide", "underground bunker", "biryani"],
  },
  {
    id: 9,
    title: "The Best Places to Visit in Himachal",
    topic: "Travel & Exploration",
    expectedObjective: ["Discovery", "List", "Curiosity"],
    expectedKeywordsInSubject: ["mountain", "himachal", "snow", "peak", "valley", "alpine", "vista", "monastery", "explorer"],
    forbiddenInSubject: ["developer", "programmer", "laptop", "ide", "workstation", "underground bunker"],
  },
  {
    id: 10,
    title: "5 Gaming Mistakes Beginners Make",
    topic: "Gaming & Esports",
    expectedObjective: ["Warning", "List", "Explanation"],
    expectedKeywordsInSubject: ["game", "gaming", "controller", "screen", "player", "defeat", "headset", "character"],
    forbiddenInSubject: ["biryani", "cricket", "gym", "underground bunker"],
  },
  {
    id: 11,
    title: "What They Actually Hide Inside Google Headquarters...",
    topic: "Tech Company Culture & Investigation",
    expectedObjective: ["Curiosity", "Mystery", "Discovery"],
    expectedKeywordsInSubject: ["google", "headquarters", "campus", "door", "security", "turnstile", "restricted", "office", "perk", "entrance"],
    forbiddenInSubject: ["underground bunker", "alien laboratory", "futuristic laser vault"],
  },
];

async function runThumbnailDesignerAudit() {
  console.log("================================================================================");
  console.log("🎨 WAVELENGTH YOUTUBE THUMBNAIL DESIGNER AUDIT & VALIDATION SUITE");
  console.log("================================================================================\n");

  let allPassed = true;
  const results: any[] = [];

  for (const tc of DESIGNER_TEST_MATRIX) {
    const isSpecial = tc.id === 11;
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[Test ${tc.id}/11] ${isSpecial ? "⭐ ACCEPTANCE TEST: " : "Topic: "} "${tc.title}"`);
    console.log(`--------------------------------------------------------------------------------`);

    try {
      const output: ThumbnailIntelligenceOutput = await runThumbnailIntelligence({
        title: tc.title,
        topic: tc.topic,
      });

      console.log(`  🎯 1. Thumbnail Objective:`);
      console.log(`     - Type: ${output.objective.type}`);
      console.log(`     - 1-Second Promise: "${output.objective.oneSecondPromise}"`);
      console.log(`     - Emotional Trigger: "${output.objective.emotionalTrigger}"`);

      console.log(`  📖 2. Visual Story & Hierarchy:`);
      console.log(`     - Narrative: "${output.visualStory.narrative}"`);
      console.log(`     - Primary Focal Subject: "${output.visualStory.primaryFocalSubject}"`);
      console.log(`     - Secondary Elements: [${output.visualStory.secondaryElements.join(", ")}]`);
      console.log(`     - Background: "${output.visualStory.backgroundEnvironment}"`);
      console.log(`     - Subject Position: ${output.visualStory.subjectPosition}`);

      console.log(`  📐 3. Composition Layout:`);
      console.log(`     - Layout Type: ${output.layout}`);

      console.log(`  🔤 4. Text Strategy:`);
      console.log(`     - Overlay Text: "${output.textStrategy.overlayText}" (${output.textStrategy.wordCount} words)`);
      console.log(`     - Placement Zone: ${output.textStrategy.layoutZone}`);

      console.log(`  🛡️ 5. QA Assessment:`);
      console.log(`     - Focal Point: ${output.qa.focalPointClarity.passed ? "✅" : "❌"} (${output.qa.focalPointClarity.note})`);
      console.log(`     - Story Immediacy: ${output.qa.storyImmediacy.passed ? "✅" : "❌"}`);
      console.log(`     - Text Brevity: ${output.qa.textBrevity.passed ? "✅" : "❌"} (${output.qa.textBrevity.wordCount} words)`);
      console.log(`     - Mobile Readability: ${output.qa.mobileReadability.passed ? "✅" : "❌"}`);
      console.log(`     - Accuracy: ${output.qa.accuracyCheck.passed ? "✅" : "❌"}`);
      console.log(`     - Overall Verdict: ${output.qa.overallVerdict}`);

      // Semantic Checks
      const subjectText = `${output.visualStory.primaryFocalSubject} ${output.visualStory.narrative} ${output.visualStory.backgroundEnvironment}`.toLowerCase();

      // Check expected keywords
      const hasExpected = tc.expectedKeywordsInSubject.some((kw) => subjectText.includes(kw.toLowerCase()));
      if (!hasExpected) {
        throw new Error(`Visual story missing expected keywords: [${tc.expectedKeywordsInSubject.join(", ")}]`);
      }

      // Check forbidden keywords in positive scene
      for (const forbidden of tc.forbiddenInSubject) {
        const regex = new RegExp(`\\b${forbidden}\\b`, "i");
        if (regex.test(subjectText)) {
          throw new Error(`Positive scene contaminated with forbidden term: "${forbidden}"`);
        }
      }

      // Check text brevity (must be <= 4 words and not equal to title)
      if (output.textStrategy.wordCount > 4 || output.textStrategy.wordCount === 0) {
        throw new Error(`Text strategy word count invalid (${output.textStrategy.wordCount} words)`);
      }
      if (output.textStrategy.overlayText.toLowerCase() === tc.title.toLowerCase()) {
        throw new Error("Text strategy duplicated full video title");
      }

      // Special acceptance criteria for Google HQ
      if (isSpecial) {
        if (subjectText.includes("empty room") || subjectText.includes("blue room") || subjectText.includes("underground bunker")) {
          throw new Error("Google HQ test failed acceptance: produced empty room or fictional bunker");
        }
        if (output.textStrategy.overlayText === "HIDDEN SECRETS") {
          console.warn("Notice: Generated 'HIDDEN SECRETS', checking if supported by objective.");
        }
      }

      console.log(`  ✅ PASSED: Topic-grounded, professional visual hierarchy, crisp 1-4 word hook.`);
      results.push({
        id: tc.id,
        title: tc.title,
        objective: output.objective.type,
        layout: output.layout,
        overlayText: output.textStrategy.overlayText,
        subject: output.visualStory.primaryFocalSubject,
        verdict: output.qa.overallVerdict,
        passed: true,
      });
    } catch (err: any) {
      console.error(`  ❌ FAILED:`, err.message || err);
      allPassed = false;
      results.push({
        id: tc.id,
        title: tc.title,
        passed: false,
        error: err.message || err,
      });
    }
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 ALL 11 TEST MATRIX TOPICS PASSED YOUTUBE THUMBNAIL DESIGNER AUDIT!");
  } else {
    console.log("❌ SOME TOPICS FAILED AUDIT.");
  }
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runThumbnailDesignerAudit().catch((err) => {
  console.error("Designer audit crashed:", err);
  process.exit(1);
});
