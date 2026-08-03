const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

async function callClaude({ system, prompt, useWebSearch = false }) {
  const headers = { "Content-Type": "application/json" };
  if (API_TOKEN) headers["x-api-key"] = API_TOKEN;
  const res = await fetch("/api/claude", {
    method: "POST",
    headers,
    body: JSON.stringify({ system, prompt, useWebSearch }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);

  return data.text || "";
}

function extractJSON(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("No JSON found in model response.");
  }

  const candidates = [];
  const raw = text.trim();

  if (raw.startsWith("{") || raw.startsWith("[")) {
    candidates.push(raw);
  }

  const fencedBlocks = [...raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  fencedBlocks.forEach((match) => {
    if (match[1]?.trim()) candidates.push(match[1].trim());
  });

  for (const candidate of candidates) {
    const cleaned = candidate.trim();
    const firstBracket = Math.min(
      ...["[", "{"].map((token) => {
        const index = cleaned.indexOf(token);
        return index === -1 ? Infinity : index;
      })
    );
    const lastBracket = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));

    if (!Number.isFinite(firstBracket) || lastBracket === -1) {
      continue;
    }

    try {
      return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    } catch {
      // try the next candidate
    }
  }

  throw new Error("No JSON found in model response.");
}

export { callClaude, extractJSON };
