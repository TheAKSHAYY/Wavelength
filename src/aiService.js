const sources = ["GitHub Trending", "Reddit", "Hacker News", "Product Hunt", "YouTube", "Web"];
const formats = ["Tutorial", "Deep-dive", "Comparison", "Build in public", "Explainer", "Shorts series"];
const intents = ["Tutorial", "Comparison", "Problem solving", "Beginner", "Advanced", "Career"];

const clean = (value, fallback = "your topic") => (value || fallback).trim();
const scoreFrom = (text, offset = 0) => 62 + (([...text].reduce((sum, char) => sum + char.charCodeAt(0), offset) % 34));
const pick = (list, seed) => list[Math.abs(seed) % list.length];

function fetchWithTimeout(url, options, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function generateResponse({ system = "", prompt = "", useWebSearch = false }) {
  try {
    const response = await fetchWithTimeout("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, prompt, useWebSearch }),
    }, 8000);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (err.error?.includes?.("quota") || err.error?.includes?.("429") || response.status === 429) {
        throw new Error("QUOTA_EXCEEDED");
      }
      throw new Error("API unavailable");
    }
    const data = await response.json();
    if (!data.text) throw new Error("Empty API response");
    if (!hasJSON(data.text)) throw new Error("API response did not include JSON");
    return data.text;
  } catch (error) {
    console.warn("Using local fallback generator:", error.message);
    return generateMockResponse({ system, prompt, useWebSearch });
  }
}

function hasJSON(text) {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  const firstBracket = Math.min(
    ...["[", "{"].map((char) => (cleaned.indexOf(char) === -1 ? Infinity : cleaned.indexOf(char)))
  );
  const lastBracket = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  return Number.isFinite(firstBracket) && lastBracket > firstBracket;
}

function makeIdPrefix() {
  return Date.now();
}

export async function generateMockResponse({ system = "", prompt = "" }) {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const lower = `${system}\n${prompt}`.toLowerCase();
  const topic = clean(
    (prompt.match(/(?:topic|niche|field|channel name|video title)[:/ ]+([^\n]+)/i) || [])[1],
    "developer content"
  );
  const base = scoreFrom(topic);

  if (lower.includes("current trending topics")) {
    return JSON.stringify(Array.from({ length: 5 }, (_, index) => ({
      topic: [
        `${topic}: practical AI workflow demos`,
        `${topic}: mistakes beginners keep making`,
        `${topic}: fast project teardown`,
        `${topic}: tool stack comparison`,
        `${topic}: roadmap for the next 30 days`,
      ][index],
      source: pick(sources, base + index),
      score: Math.min(98, base + index * 3),
      growth: 14 + index * 7,
      competition: pick(["Low", "Medium", "High"], base + index),
      format: pick(formats, base + index),
      length: pick(["6-8 min", "8-12 min", "12-18 min", "30-45 sec"], base + index),
    })));
  }

  if (lower.includes("youtube titles")) {
    return JSON.stringify(["High CTR", "Curiosity", "Educational", "SEO", "Short", "Long"].map((style, index) => ({
      title: [
        `I Tried ${topic} So You Don't Have To`,
        `The Hidden Problem With ${topic}`,
        `${topic}: A Practical Beginner Guide`,
        `${topic} Tutorial: Build, Debug, and Ship`,
        `${topic} Fast`,
        `Everything I Wish I Knew Before Learning ${topic}`,
      ][index],
      style,
      ctr: Math.min(99, base + index * 2),
    })));
  }

  if (lower.includes("script outline")) {
    return JSON.stringify({
      hook: `Most people approach ${topic} backwards, so let's fix the path in the first minute.`,
      intro: `This video breaks ${topic} into a clear workflow with examples you can reuse immediately.`,
      sections: [
        { heading: "The problem", content: `Show why ${topic} feels confusing and what viewers usually miss.` },
        { heading: "The simple model", content: `Introduce a repeatable mental model with one concrete example.` },
        { heading: "Build it", content: "Walk through the core steps, keeping the screen focused on decisions." },
        { heading: "Common traps", content: "Call out mistakes that cost time and show the cleaner fix." },
      ],
      cta: "Ask viewers to comment with the project they want broken down next.",
      chapters: ["0:00 Hook", "0:15 Setup", "1:20 Core idea", "4:30 Build", "7:45 Traps", "9:10 Wrap"],
    });
  }

  if (lower.includes("content landscape")) {
    return JSON.stringify({
      summary: `${topic} has strong tutorial demand, but most content stops at surface-level demos.`,
      subtopics: ["basics", "project walkthroughs", "tooling", "debugging", "career use cases"],
      gaps: ["honest failure breakdowns", "small complete projects", "clear beginner-to-intermediate paths"],
      audienceNeeds: "Viewers want fewer vague tips and more finished examples they can adapt.",
    });
  }

  if (lower.includes("5-video content roadmap")) {
    return JSON.stringify(Array.from({ length: 5 }, (_, index) => ({
      order: index + 1,
      title: [
        `${topic}: The Map Before You Start`,
        `Build Your First Useful ${topic} Project`,
        `Debugging ${topic} Like a Pro`,
        `${topic} Tools Ranked by Real Use`,
        `Your 30-Day ${topic} Growth Plan`,
      ][index],
      angle: "Move from clarity to execution with a concrete viewer payoff.",
      format: pick(formats, base + index),
      priority: pick(["High", "Medium", "Low"], index),
    })));
  }

  if (lower.includes("complete youtube content package")) {
    return JSON.stringify({
      idea: {
        title: `I Built a ${topic} Workflow From Scratch`,
        viral: Math.min(97, base + 8),
        demand: "High",
        difficulty: "Medium",
        audience: "Curious builders who want practical examples.",
        whyPromising: "It combines a clear outcome, timely tooling, and a visible before-and-after.",
      },
      thumbnail: {
        layout: "Split screen: messy setup on left, clean result on right.",
        text: "FIX THIS",
        colors: ["#ffb020", "#6ee7b7", "#111827"],
        emotion: "surprised but focused",
        composition: "Large face or cursor highlight, bold result preview, minimal text.",
      },
      script: JSON.parse(await generateMockResponse({ system: "script outline", prompt: `Video title: ${topic}` })),
      sources: [
        { name: "Community discussions", note: "Use recurring audience pain points as framing." },
        { name: "Recent tutorials", note: "Compare your example against common shallow demos." },
        { name: "Product docs", note: "Ground claims in official behavior where possible." },
      ],
    });
  }

  if (lower.includes("keyword")) {
    return JSON.stringify(Array.from({ length: 8 }, (_, index) => ({
      keyword: [
        `${topic} tutorial`,
        `${topic} project`,
        `${topic} for beginners`,
        `${topic} mistakes`,
        `${topic} roadmap`,
        `${topic} vs alternatives`,
        `${topic} interview prep`,
        `${topic} explained`,
      ][index],
      intent: pick(intents, index),
      opportunity: Math.min(99, base + index * 3),
    })));
  }

  if (lower.includes("competitor")) {
    return JSON.stringify({
      name: topic,
      avgViews: `${Math.round(base / 10)}.${base % 10}K`,
      uploadFreq: pick(["2/week", "weekly", "3/month"], base),
      trend: pick(["up", "down"], base),
      gap: `Their strongest gap is practical ${topic} breakdowns with templates viewers can reuse.`,
    });
  }

  if (lower.includes("recommendations")) {
    return JSON.stringify([
      { kind: "opportunity", text: `Turn your strongest trend into a practical ${topic} walkthrough this week.` },
      { kind: "warning", text: "Avoid broad titles; anchor each video around one visible outcome." },
      { kind: "experiment", text: "Test one short-form teaser before publishing the full tutorial." },
    ]);
  }

  return JSON.stringify([{ id: makeIdPrefix(), text: `Generated idea for ${topic}` }]);
}
