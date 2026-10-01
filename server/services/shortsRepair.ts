import { generateAICompletion } from "./aiProvider.js";
import type { ShortsBlueprintOutput, ShortsDuration } from "./shortsIntelligence.js";
import { buildMasterAiEditorPrompt } from "./shortsIntelligence.js";
import type { QualityIssue } from "./shortsQuality.js";

/**
 * Targeted AI Repair function.
 * Sends only the specific detected validation/QA issues back to the AI model for surgical repair.
 */
export async function repairShortsBlueprint(
  blueprint: Omit<ShortsBlueprintOutput, "qualityAssessment">,
  issues: QualityIssue[],
  _duration: ShortsDuration
): Promise<Omit<ShortsBlueprintOutput, "qualityAssessment">> {
  const problemsList = issues
    .map((iss, i) => `${i + 1}. [${iss.type}] ${iss.message}`)
    .join("\n");

  const systemPrompt = `You are Wavelength's AI Video Blueprint Quality Repair Specialist.
The previously generated Shorts blueprint contains specific validation or quality issues.
Your job is to surgically repair ONLY the reported problems while preserving all valid, high-quality content.

PROBLEMS TO FIX:
${problemsList}

REPAIR RULES:
1. Fix all listed issues strictly.
2. If repetitive scenes or voiceovers were detected, replace the duplicates with fresh, relevant insights.
3. If pacing or duration had timing errors, calibrate scene time ranges sequentially.
4. Keep the target topic ("${blueprint.topic}") strictly in focus.
5. Return ONLY valid structured JSON matching the repaired timeline and full voiceover.`;

  const userPrompt = `ORIGINAL SCRIPT:
"${blueprint.script.fullVoiceover}"

ORIGINAL SCENES:
${JSON.stringify(blueprint.timeline, null, 2)}

Fix the reported issues and return the updated JSON with repaired "fullVoiceover" and "timeline".`;

  try {
    const aiResult = await generateAICompletion({
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
      maxTokens: 3000,
      jsonMode: true,
    });

    if (!aiResult || !aiResult.text) {
      return blueprint;
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
        return blueprint;
      }
    }

    if (Array.isArray(parsed.timeline) && parsed.timeline.length > 0) {
      const timeline = parsed.timeline;
      const combinedVoiceover =
        parsed.fullVoiceover ||
        timeline.map((s: any) => s.voiceover).filter(Boolean).join(" ") ||
        blueprint.script.fullVoiceover;
      const words = combinedVoiceover.split(/\s+/).filter(Boolean);

      const repairedBlueprint = {
        ...blueprint,
        script: {
          ...blueprint.script,
          fullVoiceover: combinedVoiceover,
          wordCount: words.length,
          estimatedSeconds: Math.round(words.length / 2.7) || blueprint.script.estimatedSeconds,
        },
        timeline,
      };

      return {
        ...repairedBlueprint,
        finalAiEditorPrompt: buildMasterAiEditorPrompt(repairedBlueprint),
      };
    }
  } catch (err) {
    console.warn("AI Repair pipeline encountered error, falling back to original:", err);
  }

  return blueprint;
}
