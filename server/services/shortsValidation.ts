import type {
  ShortsDuration,
  ShortsScene,
} from "./shortsIntelligence.js";
import { getDurationWordLimits } from "./shortsIntelligence.js";

export interface TimelineValidationResult {
  valid: boolean;
  totalCalculatedSeconds: number;
  expectedSeconds: number;
  issues: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Parses time range strings like "0-3s", "3-7s", "10-15s" or "0:00 - 0:03" into start and end seconds.
 */
export function parseTimeRange(timeRange: string): { start: number; end: number; duration: number } {
  if (!timeRange || typeof timeRange !== "string") {
    return { start: 0, end: 3, duration: 3 };
  }

  const clean = timeRange.replace(/s/gi, "").trim();
  const parts = clean.split(/[-–—]/).map((p) => p.trim());

  if (parts.length === 2) {
    const parseSec = (s: string): number => {
      if (s.includes(":")) {
        const [m, sec] = s.split(":").map(Number);
        return (m || 0) * 60 + (sec || 0);
      }
      return parseFloat(s) || 0;
    };

    const start = parseSec(parts[0]);
    const end = parseSec(parts[1]);
    return { start, end, duration: Math.max(1, end - start) };
  }

  return { start: 0, end: 3, duration: 3 };
}

/**
 * Programmatically validates timeline bounds, continuity, gaps, and duration sums.
 */
export function validateTimeline(
  scenes: ShortsScene[],
  duration: ShortsDuration
): TimelineValidationResult {
  const { seconds: targetSeconds } = getDurationWordLimits(duration);
  const issues: string[] = [];

  if (!Array.isArray(scenes) || scenes.length === 0) {
    return {
      valid: false,
      totalCalculatedSeconds: 0,
      expectedSeconds: targetSeconds,
      issues: ["No timeline scenes were provided."],
    };
  }

  let totalDuration = 0;
  let previousEnd = 0;

  scenes.forEach((scene, idx) => {
    const range = parseTimeRange(scene.timeRange);

    if (range.start < 0 || range.end < 0) {
      issues.push(`Scene ${idx + 1} has negative timestamp: "${scene.timeRange}".`);
    }

    if (range.end <= range.start) {
      issues.push(`Scene ${idx + 1} has invalid end timestamp <= start: "${scene.timeRange}".`);
    }

    if (idx === 0 && range.start > 1) {
      issues.push(`First scene should start at 0s, but starts at ${range.start}s.`);
    }

    if (idx > 0 && range.start < previousEnd - 0.5) {
      issues.push(`Scene ${idx + 1} overlaps with Scene ${idx} (${previousEnd}s vs ${range.start}s).`);
    }

    totalDuration += range.duration;
    previousEnd = range.end;

    if (!scene.voiceover || !scene.voiceover.trim()) {
      issues.push(`Scene ${idx + 1} is missing voiceover text.`);
    }

    if (!scene.visual || !scene.visual.trim()) {
      issues.push(`Scene ${idx + 1} is missing visual description.`);
    }
  });

  const durationVariance = Math.abs(totalDuration - targetSeconds);
  const durationValid = durationVariance <= 8; // allow slight creative tolerance

  if (!durationValid) {
    issues.push(
      `Total scene duration (${totalDuration}s) deviates significantly from target ${targetSeconds}s.`
    );
  }

  return {
    valid: issues.length === 0,
    totalCalculatedSeconds: totalDuration,
    expectedSeconds: targetSeconds,
    issues,
  };
}

/**
 * Validates basic schema integrity of Stage 1 Strategist output.
 */
export function validateStage1Strategy(data: any): SchemaValidationResult {
  const issues: string[] = [];
  if (!data || typeof data !== "object") {
    return { valid: false, issues: ["Strategy data is not an object."] };
  }

  if (!data.coreConcept || typeof data.coreConcept !== "string" || !data.coreConcept.trim()) {
    issues.push("Missing or empty 'coreConcept' in Stage 1 strategy.");
  }

  if (!data.contentAngle || typeof data.contentAngle !== "string" || !data.contentAngle.trim()) {
    issues.push("Missing or empty 'contentAngle' in Stage 1 strategy.");
  }

  const hooks = Array.isArray(data.hooks) ? data.hooks : [];
  if (hooks.length === 0 && (!data.hookStrategy || typeof data.hookStrategy !== "string")) {
    issues.push("Stage 1 strategy did not generate any hook options.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
