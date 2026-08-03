type ParseResult = { ok: true; value: unknown } | { ok: false };

function tryParse(s: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
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

export function extractJSON(text: string): unknown {
  const raw = (text || "").trim();
  if (!raw) {
    throw new Error("No JSON found in model response.");
  }

  // Fenced code blocks are the most common LLM wrapping, so try those first.
  const fenced = [...raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  for (const match of fenced) {
    const attempt = tryParse(match[1]?.trim() ?? "");
    if (attempt.ok) return attempt.value;
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
    if (attempt.ok) return attempt.value;
  }

  throw new Error("No JSON found in model response.");
}
