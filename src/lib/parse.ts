type ParseResult = { ok: true; value: unknown } | { ok: false };

function tryParse(s: string): ParseResult {
  const trimmed = (s || "").trim();
  if (!trimmed) return { ok: false };

  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    // Attempt robust sanitization: remove trailing commas, fix unquoted keys
    try {
      const sanitized = trimmed
        .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // Quote unquoted keys

      return { ok: true, value: JSON.parse(sanitized) };
    } catch {
      return { ok: false };
    }
  }
}

// Finds the index of the bracket that closes the one that opened at `start`,
// skipping string contents.
function findBalancedEnd(text: string, start: number, open: string): number {
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function normalizeJsonKeys(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(normalizeJsonKeys);
  }
  if (data && typeof data === "object" && !(data instanceof Date)) {
    const record = data as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      const lower = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      let targetKey = key;

      if (lower === "viralscore" || lower === "virality" || lower === "viralrate" || lower === "viralrating") {
        targetKey = "viral";
      } else if (lower === "targetaudience" || lower === "target" || lower === "audiencetype") {
        targetKey = "audience";
      } else if (lower === "searchdemand" || lower === "demandlevel" || lower === "demandscore") {
        targetKey = "demand";
      } else if (lower === "difficultylevel" || lower === "complexity" || lower === "effort") {
        targetKey = "difficulty";
      } else if (lower === "whypromising" || lower === "whyworks" || lower === "whyitworks") {
        targetKey = "whyPromising";
      } else if (lower === "videotitle" || lower === "concepttitle") {
        targetKey = "title";
      }

      normalized[targetKey] = normalizeJsonKeys(value);
    }
    return normalized;
  }
  return data;
}

export function extractJSON(text: string): unknown {
  const raw = (text || "").trim();
  if (!raw) {
    throw new Error("No JSON found in model response.");
  }

  // Fenced code blocks are the most common LLM wrapping, so try those first.
  const fenced = [...raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  for (const match of fenced) {
    const attempt = tryParse(match[1]?.trim() ?? "");
    if (attempt.ok) return normalizeJsonKeys(attempt.value);
  }

  // Otherwise scan the whole string for the first balanced JSON value
  // (object or array), skipping prose around it.
  const starts: Array<{ ch: string; index: number }> = [];
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "{" || ch === "[") starts.push({ ch, index: i });
  }

  for (const start of starts) {
    const end = findBalancedEnd(raw, start.index, start.ch);
    if (end === -1) continue;
    const attempt = tryParse(raw.slice(start.index, end + 1));
    if (attempt.ok) return normalizeJsonKeys(attempt.value);
  }

  throw new Error("No JSON found in model response.");
}

