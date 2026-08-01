import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import {
  LayoutGrid, Radar, Users, Sparkles, CalendarDays, LineChart as LineChartIcon, Bell,
  Search, ChevronRight, TrendingUp, TrendingDown, Clock, Flame, Target,
  Youtube, Github, MessageSquare, Newspaper, ArrowUpRight, Plus, X, RefreshCw, Loader2,
  Type, FileText, Copy, Check, Image, Link2, KeyRound, Wand2, Layers,
  Compass, ChevronDown, ChevronUp, ListChecks,
} from "lucide-react";
import { generateResponse } from "./aiService";

// ---------------------------------------------------------------------------
// Claude API helper
// ---------------------------------------------------------------------------

async function callClaude({ system, prompt, useWebSearch = false }) {
  return generateResponse({ system, prompt, useWebSearch });
}

function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const firstBracket = Math.min(
    ...["[", "{"].map((c) => (cleaned.indexOf(c) === -1 ? Infinity : cleaned.indexOf(c)))
  );
  const lastBracket = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (!isFinite(firstBracket) || lastBracket === -1) throw new Error("No JSON found");
  return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
}

const clampScore = (value, fallback = 70) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const asText = (value, fallback = "Not specified") => String(value || fallback).trim();
const asArray = (value) => (Array.isArray(value) ? value : []);

function normalizeTrend(item, index) {
  return {
    id: Date.now() + index,
    topic: asText(item.topic, "Untitled trend"),
    source: oneOf(item.source, ["GitHub Trending", "Reddit", "Hacker News", "Product Hunt", "YouTube", "Web"], "Web"),
    score: clampScore(item.score, 75),
    growth: Math.round(Number(item.growth) || 0),
    competition: oneOf(item.competition, ["Low", "Medium", "High"], "Medium"),
    format: asText(item.format, "Explainer"),
    length: asText(item.length, "8-12 min"),
  };
}

function normalizeIdea(item, index) {
  return {
    id: Date.now() + index,
    title: asText(item.title, "Untitled video idea"),
    viral: clampScore(item.viral, 72),
    demand: oneOf(item.demand, ["Low", "Medium", "High"], "Medium"),
    difficulty: oneOf(item.difficulty, ["Low", "Medium", "High"], "Medium"),
    audience: asText(item.audience, "Curious viewers"),
  };
}

function normalizeTitle(item, index) {
  return {
    id: Date.now() + index,
    title: asText(item.title, "Untitled video title"),
    style: oneOf(item.style, ["High CTR", "Curiosity", "Educational", "SEO", "Short", "Long"], "Educational"),
    ctr: clampScore(item.ctr, 70),
  };
}

function normalizeScript(value) {
  return {
    hook: asText(value.hook, "Open with a clear viewer problem and promise a practical payoff."),
    intro: asText(value.intro, "Set context, define the outcome, and tell viewers what they will build or learn."),
    sections: asArray(value.sections).slice(0, 6).map((section, index) => ({
      heading: asText(section.heading, `Section ${index + 1}`),
      content: asText(section.content, "Explain the idea with a concrete example."),
    })),
    cta: asText(value.cta, "Ask viewers what they want covered next."),
    chapters: asArray(value.chapters).map((chapter) => asText(chapter)),
  };
}

function normalizeResearch(value) {
  return {
    summary: asText(value.summary, "This field has active audience demand and several practical content gaps."),
    subtopics: asArray(value.subtopics).slice(0, 7).map((item) => asText(item)),
    gaps: asArray(value.gaps).slice(0, 5).map((item) => asText(item)),
    audienceNeeds: asText(value.audienceNeeds, "Viewers want clear examples, realistic workflows, and fewer vague tips."),
  };
}

function normalizePlan(item, index) {
  return {
    id: Date.now() + index,
    order: Number(item.order) || index + 1,
    title: asText(item.title, "Untitled roadmap video"),
    angle: asText(item.angle, "A practical angle with a clear viewer outcome."),
    format: asText(item.format, "Tutorial"),
    priority: oneOf(item.priority, ["High", "Medium", "Low"], index < 2 ? "High" : "Medium"),
  };
}

function normalizePackage(value) {
  return {
    idea: {
      title: asText(value.idea?.title, "Untitled content package"),
      viral: clampScore(value.idea?.viral, 75),
      demand: oneOf(value.idea?.demand, ["Low", "Medium", "High"], "Medium"),
      difficulty: oneOf(value.idea?.difficulty, ["Low", "Medium", "High"], "Medium"),
      audience: asText(value.idea?.audience, "Target viewers"),
      whyPromising: asText(value.idea?.whyPromising, "It gives viewers a clear, practical outcome."),
    },
    thumbnail: {
      layout: asText(value.thumbnail?.layout, "Simple before-and-after layout."),
      text: asText(value.thumbnail?.text, "START HERE"),
      colors: asArray(value.thumbnail?.colors).slice(0, 4).map((item) => asText(item, "#FFB020")),
      emotion: asText(value.thumbnail?.emotion, "curious and focused"),
      composition: asText(value.thumbnail?.composition, "Large subject, clear result preview, minimal text."),
    },
    script: normalizeScript(value.script || {}),
    sources: asArray(value.sources).slice(0, 6).map((source) => ({
      name: asText(source.name, "Source"),
      note: asText(source.note, "Use this as supporting context."),
    })),
  };
}

function normalizeKeyword(item, index) {
  return {
    id: Date.now() + index,
    keyword: asText(item.keyword, "keyword"),
    intent: oneOf(item.intent, ["Informational", "Comparison", "Tutorial", "Commercial", "Problem solving", "Beginner", "Advanced", "Career"], "Informational"),
    difficulty: oneOf(item.difficulty, ["Low", "Medium", "High"], "Medium"),
    opportunity: clampScore(item.opportunity, 70),
  };
}

function normalizeCompetitor(value) {
  return {
    id: Date.now(),
    name: asText(value.name, "Unknown channel"),
    uploadFreq: asText(value.uploadFreq, "Unknown"),
    avgViews: asText(value.avgViews, "Unknown"),
    trend: oneOf(value.trend, ["up", "down"], "up"),
    lastVideo: asText(value.lastVideo, "No recent video found"),
    gap: asText(value.gap, "Look for practical angles they have not covered deeply."),
  };
}

function normalizeRecommendation(item, index) {
  return {
    id: Date.now() + index,
    text: asText(item.text, "Pick one high-demand idea and turn it into a concrete video plan."),
    kind: oneOf(item.kind, ["opportunity", "warning", "insight"], "insight"),
  };
}

// ---------------------------------------------------------------------------
// Storage helpers (personal, per-user)
// ---------------------------------------------------------------------------

async function loadKey(key, fallback) {
  try {
    const value = localStorage.getItem(`wavelength:${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    localStorage.setItem(`wavelength:${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("storage save failed", key, e);
  }
}

// ---------------------------------------------------------------------------
// Seed data (used only on very first load, before anything is generated)
// ---------------------------------------------------------------------------

const seedAnalytics = [
  { day: "Mon", views: 4200 }, { day: "Tue", views: 5100 }, { day: "Wed", views: 4800 },
  { day: "Thu", views: 6700 }, { day: "Fri", views: 8900 }, { day: "Sat", views: 11200 }, { day: "Sun", views: 9600 },
];

const sourceIcon = {
  "GitHub Trending": Github, "Reddit": MessageSquare, "Hacker News": Newspaper,
  "Product Hunt": Sparkles, "YouTube": Youtube, "Web": Search,
};
const getSourceIcon = (s) => sourceIcon[s] || Search;

const navGroups = [
  { label: "Overview", items: [{ icon: LayoutGrid, label: "Dashboard" }, { icon: Compass, label: "Field Research & Plan" }, { icon: Wand2, label: "One-Click Package" }] },
  { label: "Research", items: [{ icon: Radar, label: "Trend Discovery" }, { icon: Users, label: "Competitor Intel" }, { icon: KeyRound, label: "Keyword Research" }] },
  { label: "Create", items: [{ icon: Sparkles, label: "Idea Generator" }, { icon: Type, label: "Title Generator" }, { icon: FileText, label: "Script Assistant" }] },
  { label: "Plan & Grow", items: [{ icon: CalendarDays, label: "Content Calendar" }, { icon: LineChartIcon, label: "Analytics" }] },
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SignalMeter({ value, tone = "amber" }) {
  const bars = 10;
  const filled = Math.round(((value || 0) / 100) * bars);
  const colors = { amber: "var(--accent-amber)", mint: "var(--accent-mint)", violet: "var(--accent-violet)" };
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{ width: 3, height: 4 + i * 1.6, borderRadius: 1, background: i < filled ? colors[tone] : "var(--border)" }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon }) {
  return (
    <div className="card" style={{ padding: "18px 20px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted" style={{ fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, marginTop: 8, letterSpacing: "-0.02em" }}>{value}</div>
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 8 }}>
          <Icon size={18} color="var(--accent-amber)" />
        </div>
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 12.5, color: "var(--accent-mint)" }}>
          <ArrowUpRight size={13} /> {delta}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ eyebrow, title, action, onAction, loading }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
      <div>
        <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{eyebrow}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      {action && (
        <button className="ghost-btn" onClick={onAction} disabled={loading}>
          {loading ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />} {action}
        </button>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="muted" style={{ fontSize: 12.5, padding: "22px 6px", textAlign: "center" }}>{text}</div>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WavelengthDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [booted, setBooted] = useState(false);

  const [niche, setNiche] = useState("coding, software development and CS student content on YouTube");
  const [ideaTopic, setIdeaTopic] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  const [trends, setTrends] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [calDay, setCalDay] = useState("Mon");
  const [calType, setCalType] = useState("Tutorial");
  const [calTitle, setCalTitle] = useState("");

  const [titleTopic, setTitleTopic] = useState("");
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(null);

  const [scriptTopic, setScriptTopic] = useState("");
  const [script, setScript] = useState(null);
  const [loadingScript, setLoadingScript] = useState(false);

  const [packageTopic, setPackageTopic] = useState("");
  const [pkg, setPkg] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [pkgTab, setPkgTab] = useState("idea");

  const [fieldTopic, setFieldTopic] = useState("");
  const [research, setResearch] = useState(null);
  const [videoPlan, setVideoPlan] = useState([]);
  const [loadingStage, setLoadingStage] = useState(null); // null | "research" | "plan"
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [planScripts, setPlanScripts] = useState({});
  const [loadingPlanScriptId, setLoadingPlanScriptId] = useState(null);

  const [keywordTopic, setKeywordTopic] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      setTrends(await loadKey("trends", []));
      setIdeas(await loadKey("ideas", []));
      setCompetitors(await loadKey("competitors", []));
      setRecommendations(await loadKey("recommendations", []));
      setCalendar(await loadKey("calendar", []));
      setAlerts(await loadKey("alerts", []));
      setTitles(await loadKey("titles", []));
      setScript(await loadKey("script", null));
      setPkg(await loadKey("package", null));
      setKeywords(await loadKey("keywords", []));
      setResearch(await loadKey("research", null));
      setVideoPlan(await loadKey("videoPlan", []));
      setPlanScripts(await loadKey("planScripts", {}));
      setBooted(true);
    })();
  }, []);

  const pushAlert = useCallback((text, icon = Flame) => {
    setAlerts((prev) => {
      const next = [{ id: Date.now(), text, time: "just now", icon }, ...prev].slice(0, 6);
      saveKey("alerts", next.map(({ icon, ...rest }) => rest)); // icons aren't serializable, drop before save
      return next;
    });
  }, []);

  // Re-hydrate alert icons after storage load (icons stored as flame by default)
  useEffect(() => {
    if (booted) {
      setAlerts((prev) => prev.map((a) => ({ ...a, icon: a.icon || Flame })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  async function refreshTrends() {
    setLoadingTrends(true);
    setErrorMsg("");
    try {
      const text = await callClaude({
        useWebSearch: true,
        system:
          "You are a YouTube trend research assistant. Search the web for genuinely current trending topics relevant to the given niche. After searching, respond with ONLY a JSON array (no markdown fences, no preamble, no explanation) of exactly 5 objects with this shape: " +
          '[{"topic":"string","source":"one of GitHub Trending, Reddit, Hacker News, Product Hunt, YouTube, Web","score":number 0-100,"growth":number percent integer,"competition":"Low"|"Medium"|"High","format":"string","length":"string"}]',
        prompt: `Niche: ${niche}\n\nFind 5 real, currently trending topics for this niche and score them.`,
      });
      const parsed = extractJSON(text);
      const withIds = parsed.map((t, i) => ({ id: Date.now() + i, ...t }));
      setTrends(withIds);
      await saveKey("trends", withIds);
      const hot = withIds.find((t) => t.score >= 90);
      if (hot) pushAlert(`"${hot.topic}" crossed trend score ${hot.score}`, Flame);
    } catch (e) {
      setErrorMsg("Couldn't refresh trends right now. Try again in a moment.");
    } finally {
      setLoadingTrends(false);
    }
  }

  async function generateIdeas() {
    if (!ideaTopic.trim()) {
      setErrorMsg("Enter a topic or niche to generate ideas for.");
      return;
    }
    setLoadingIdeas(true);
    setErrorMsg("");
    try {
      const trendContext = trends.length
        ? `Current tracked trends for context: ${trends.map((t) => t.topic).join(", ")}.`
        : "";
      const text = await callClaude({
        prompt: `Topic/niche: ${ideaTopic}\n${trendContext}\n\nGenerate 3 YouTube video ideas.`,
        system:
          'Generate YouTube video ideas optimized for virality and search demand. Respond with ONLY a JSON array, no markdown fences, no preamble: [{"title":"string (an actual clickable YouTube title)","viral":number 0-100,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string"}]',
      });
      const parsed = extractJSON(text);
      const withIds = parsed.map((idea, i) => ({ id: Date.now() + i, ...idea }));
      const next = [...withIds, ...ideas].slice(0, 9);
      setIdeas(next);
      await saveKey("ideas", next);
    } catch (e) {
      setErrorMsg("Couldn't generate ideas right now. Try again in a moment.");
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function generateTitles() {
    if (!titleTopic.trim()) {
      setErrorMsg("Enter a video topic to generate titles for.");
      return;
    }
    setLoadingTitles(true);
    setErrorMsg("");
    try {
      const text = await callClaude({
        prompt: `Video topic: ${titleTopic}\n\nGenerate 6 YouTube titles covering a mix of styles.`,
        system:
          'Generate YouTube titles for the given topic, covering a mix of styles: high-CTR, curiosity-driven, educational, SEO-focused, one short (under 6 words), one long (detailed). Respond with ONLY a JSON array, no markdown fences: [{"title":"string","style":"High CTR"|"Curiosity"|"Educational"|"SEO"|"Short"|"Long","ctr":number 0-100}]',
      });
      const parsed = extractJSON(text);
      const withIds = parsed.map((t, i) => ({ id: Date.now() + i, ...t }));
      setTitles(withIds);
      await saveKey("titles", withIds);
    } catch (e) {
      setErrorMsg("Couldn't generate titles right now. Try again in a moment.");
    } finally {
      setLoadingTitles(false);
    }
  }

  function copyTitle(id, text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedTitle(id);
    setTimeout(() => setCopiedTitle(null), 1500);
  }

  async function generateScript() {
    if (!scriptTopic.trim()) {
      setErrorMsg("Enter a video title or topic to script.");
      return;
    }
    setLoadingScript(true);
    setErrorMsg("");
    try {
      const text = await callClaude({
        prompt: `Video title/topic: ${scriptTopic}`,
        system:
          'Write a YouTube video script outline for the given topic, aimed at a junior-developer / CS-student audience. Respond with ONLY JSON, no markdown fences: {"hook":"string, first 10-15 seconds, scroll-stopping","intro":"string, 2-3 sentences setting up the video","sections":[{"heading":"string","content":"string, 2-3 sentences of what to say/show"}] (3-5 sections),"cta":"string, natural call to action","chapters":["string timestamps labels like 0:00 Hook, 0:15 Intro, ..."]}',
      });
      const parsed = extractJSON(text);
      setScript(parsed);
      await saveKey("script", parsed);
    } catch (e) {
      setErrorMsg("Couldn't generate a script right now. Try again in a moment.");
    } finally {
      setLoadingScript(false);
    }
  }

  async function researchAndPlan() {
    if (!fieldTopic.trim()) {
      setErrorMsg("Enter a field or topic to research.");
      return;
    }
    setErrorMsg("");
    setResearch(null);
    setVideoPlan([]);
    setPlanScripts({});
    setExpandedPlanId(null);

    try {
      setLoadingStage("research");
      const researchText = await callClaude({
        useWebSearch: true,
        prompt: `Field/topic: ${fieldTopic}\n\nResearch the current YouTube content landscape for this field.`,
        system:
          "Search the web for the current state of this field as YouTube content: what's being covered, what audiences are asking for, and what's under-served. Respond with ONLY compact JSON, no markdown fences: " +
          '{"summary":"string, 1-2 sentences on the current landscape","subtopics":["string" x5, the key sub-areas within this field],"gaps":["string" x3, under-covered angles],"audienceNeeds":"string, 1 sentence on what the audience actually wants"}',
      });
      const researchParsed = extractJSON(researchText);
      setResearch(researchParsed);
      await saveKey("research", researchParsed);

      setLoadingStage("plan");
      const planText = await callClaude({
        prompt: `Field: ${fieldTopic}\nResearch findings: ${JSON.stringify(researchParsed)}\n\nBuild a 5-video content plan/roadmap for this field, ordered logically.`,
        system:
          'Based on the research, create a 5-video YouTube content roadmap for this field, ordered as a logical viewer journey. Respond with ONLY a JSON array of 5 objects, no markdown fences: [{"order":number,"title":"string, an actual clickable title","angle":"string, 1 sentence on the unique angle","format":"string, e.g. Tutorial / Deep-dive / Comparison / Short","priority":"High"|"Medium"|"Low"}]',
      });
      const planParsed = extractJSON(planText);
      const withIds = planParsed.map((p, i) => ({ id: Date.now() + i, ...p }));
      setVideoPlan(withIds);
      await saveKey("videoPlan", withIds);
      pushAlert(`Video plan ready for "${fieldTopic}" \u2014 ${withIds.length} videos mapped`, Compass);
    } catch (e) {
      setErrorMsg("Couldn't complete the research + plan right now. Try again in a moment.");
    } finally {
      setLoadingStage(null);
    }
  }

  async function generatePlanScript(item) {
    setLoadingPlanScriptId(item.id);
    setErrorMsg("");
    try {
      const text = await callClaude({
        prompt: `Video title: ${item.title}\nAngle: ${item.angle}\nFormat: ${item.format}`,
        system:
          'Write a YouTube script outline for the given video, aimed at a junior-developer / CS-student audience. Respond with ONLY JSON, no markdown fences: {"hook":"string, 1-2 sentences, scroll-stopping","intro":"string, 1-2 sentences","sections":[{"heading":"string","content":"string, 1-2 sentences"}] (3-4 sections),"cta":"string"}',
      });
      const parsed = extractJSON(text);
      const next = { ...planScripts, [item.id]: parsed };
      setPlanScripts(next);
      await saveKey("planScripts", next);
      setExpandedPlanId(item.id);
    } catch (e) {
      setErrorMsg("Couldn't script that video right now. Try again in a moment.");
    } finally {
      setLoadingPlanScriptId(null);
    }
  }

  async function generatePackage() {
    if (!packageTopic.trim()) {
      setErrorMsg("Enter a topic to generate a full content package.");
      return;
    }
    setLoadingPackage(true);
    setErrorMsg("");
    setPkg(null);
    try {
      const text = await callClaude({
        useWebSearch: true,
        prompt: `Topic: ${packageTopic}\n\nSearch the web briefly for current context on this topic, then produce a complete YouTube content package. Keep every field short and punchy \u2014 this must fit a tight token budget.`,
        system:
          "You are a YouTube content strategist. Respond with ONLY compact JSON, no markdown fences, no preamble, keep all text fields brief (1 sentence max each): " +
          '{"idea":{"title":"string","viral":number 0-100,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string","whyPromising":"string, 1 sentence"},' +
          '"thumbnail":{"layout":"string","text":"string, 3-5 words for thumbnail overlay","colors":["string","string","string"],"emotion":"string","composition":"string"},' +
          '"script":{"hook":"string, 1-2 sentences","intro":"string, 1-2 sentences","sections":[{"heading":"string","content":"string, 1 sentence"}],"cta":"string"},' +
          '"sources":[{"name":"string, where this insight came from","note":"string, 1 short sentence"}]}',
      });
      const parsed = extractJSON(text);
      setPkg(parsed);
      await saveKey("package", parsed);
      setPkgTab("idea");
      pushAlert(`Content package ready for "${packageTopic}"`, Wand2);
    } catch (e) {
      setErrorMsg("Couldn't generate the full package right now. Try again in a moment.");
    } finally {
      setLoadingPackage(false);
    }
  }

  async function generateKeywords() {
    if (!keywordTopic.trim()) {
      setErrorMsg("Enter a topic to research keywords for.");
      return;
    }
    setLoadingKeywords(true);
    setErrorMsg("");
    try {
      const text = await callClaude({
        useWebSearch: true,
        prompt: `Topic: ${keywordTopic}\n\nResearch real YouTube/Google search keywords for this topic.`,
        system:
          'Search the web for real search behavior around this topic, then list keywords. Respond with ONLY a JSON array of 6 objects, no markdown fences: [{"keyword":"string","intent":"Informational"|"Comparison"|"Tutorial"|"Commercial","difficulty":"Low"|"Medium"|"High","opportunity":number 0-100}]',
      });
      const parsed = extractJSON(text);
      const withIds = parsed.map((k, i) => ({ id: Date.now() + i, ...k }));
      setKeywords(withIds);
      await saveKey("keywords", withIds);
    } catch (e) {
      setErrorMsg("Couldn't research keywords right now. Try again in a moment.");
    } finally {
      setLoadingKeywords(false);
    }
  }

  async function trackCompetitor() {
    if (!competitorInput.trim()) return;
    setLoadingCompetitor(true);
    setErrorMsg("");
    try {
      const text = await callClaude({
        useWebSearch: true,
        prompt: `YouTube channel name: ${competitorInput}\n\nSearch for recent, real information about this channel.`,
        system:
          'Search the web for real information about the given YouTube channel: recent upload activity, rough view counts, content focus, and one content gap a competing creator could exploit. If you cannot find the channel, make your best honest estimate and say so in the gap field. Respond with ONLY JSON, no markdown fences: {"name":"string","uploadFreq":"string","avgViews":"string","trend":"up"|"down","lastVideo":"string","gap":"string"}',
      });
      const parsed = extractJSON(text);
      const next = [{ id: Date.now(), ...parsed }, ...competitors].slice(0, 8);
      setCompetitors(next);
      await saveKey("competitors", next);
      setCompetitorInput("");
      pushAlert(`Started tracking ${parsed.name}`, Users);
    } catch (e) {
      setErrorMsg("Couldn't look up that channel right now. Try again in a moment.");
    } finally {
      setLoadingCompetitor(false);
    }
  }

  async function refreshRecommendations() {
    setLoadingRecs(true);
    setErrorMsg("");
    try {
      const context = `Tracked trends: ${trends.map((t) => `${t.topic} (score ${t.score}, competition ${t.competition})`).join("; ") || "none yet"}.
Tracked competitors: ${competitors.map((c) => `${c.name} (${c.uploadFreq}, ${c.trend})`).join("; ") || "none yet"}.
Generated ideas: ${ideas.map((i) => i.title).join("; ") || "none yet"}.`;
      const text = await callClaude({
        prompt: context,
        system:
          'Based on this creator\'s current tracked data, give 4 short, specific, actionable recommendations. Respond with ONLY a JSON array, no markdown fences: [{"text":"string, one sentence, specific","kind":"opportunity"|"warning"|"insight"}]',
      });
      const parsed = extractJSON(text);
      const withIds = parsed.map((r, i) => ({ id: Date.now() + i, ...r }));
      setRecommendations(withIds);
      await saveKey("recommendations", withIds);
    } catch (e) {
      setErrorMsg("Couldn't generate recommendations right now.");
    } finally {
      setLoadingRecs(false);
    }
  }

  function addCalendarEntry() {
    if (!calTitle.trim()) return;
    const next = [...calendar, { id: Date.now(), day: calDay, type: calType, title: calTitle }];
    setCalendar(next);
    saveKey("calendar", next);
    setCalTitle("");
  }

  function removeCalendarEntry(id) {
    const next = calendar.filter((c) => c.id !== id);
    setCalendar(next);
    saveKey("calendar", next);
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        :root {
          --bg: #0B0E13; --surface: #12161D; --surface-2: #171C24; --border: #232A34;
          --text: #E9EDF1; --text-muted: #8A94A3;
          --accent-amber: #FFB020; --accent-mint: #6EE7B7; --accent-red: #FB7185; --accent-violet: #A78BFA;
          --font-display: 'Space Grotesk', sans-serif; --font-body: 'Inter', sans-serif; --font-mono: 'IBM Plex Mono', monospace;
        }
        .app { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; display: flex; -webkit-font-smoothing: antialiased; }
        .muted { color: var(--text-muted); }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; }
        .hero-card { background: linear-gradient(165deg, rgba(255,176,32,0.07), var(--surface) 55%); border: 1px solid rgba(255,176,32,0.25); border-radius: 16px; }
        .ghost-btn { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--text-muted); font-family: var(--font-body); font-size: 12.5px; cursor: pointer; padding: 4px 2px; }
        .ghost-btn:hover:not(:disabled) { color: var(--accent-amber); }
        .ghost-btn:disabled { opacity: 0.6; cursor: default; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sidebar { width: 232px; border-right: 1px solid var(--border); padding: 22px 14px; flex-shrink: 0; display: flex; flex-direction: column; }
        .brand { display: flex; align-items: center; gap: 9px; padding: 0 8px 22px 8px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
        .brand-mark { width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg, var(--accent-amber), #E8890C); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nav-group-label { font-size: 10.5px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-muted); padding: 16px 10px 6px 10px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; font-size: 13.5px; color: var(--text-muted); cursor: pointer; }
        .nav-item:hover { background: var(--surface); color: var(--text); }
        .nav-item.active { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
        .nav-item.active svg { color: var(--accent-amber); }
        .main { flex: 1; min-width: 0; padding: 22px 32px 60px 32px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; }
        .icon-btn { width: 36px; height: 36px; border-radius: 9px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
        .grid-2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; margin-bottom: 22px; }
        .list-row { display: flex; align-items: center; gap: 14px; padding: 13px 6px; border-bottom: 1px solid var(--border); }
        .list-row:last-child { border-bottom: none; }
        .pill { font-size: 10.5px; font-weight: 500; padding: 3px 8px; border-radius: 20px; font-family: var(--font-mono); white-space: nowrap; }
        .input { background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; padding: 8px 12px; color: var(--text); font-size: 13px; font-family: var(--font-body); outline: none; }
        .input:focus { border-color: var(--accent-amber); }
        .btn { background: var(--accent-amber); color: #0B0E13; border: none; border-radius: 9px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn:disabled { opacity: 0.5; cursor: default; }
        .btn:focus-visible, .input:focus-visible, .ghost-btn:focus-visible { outline: 2px solid var(--accent-amber); outline-offset: 2px; }
        @media (max-width: 900px) { .sidebar { display: none; } .grid-2 { grid-template-columns: 1fr; } .main { padding: 18px; } }
      `}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Radar size={15} color="#0B0E13" strokeWidth={2.5} /></div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Wavelength</div>
        </div>
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => setActiveNav(item.label)}>
                <item.icon size={16} />{item.label}
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-mint)" }} />
              <span style={{ fontSize: 12 }}>Strategy engine active</span>
            </div>
            <div className="muted" style={{ fontSize: 11 }}>Data saved in this browser</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, margin: 0 }}>Good evening, Akshay</h1>
            <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
              {trends.length || ideas.length ? "Your research is live \u2014 refresh any panel for fresh results." : "Refresh trends or generate ideas below to get started."}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input className="input" style={{ width: 260 }} placeholder="Niche, e.g. coding on YouTube" value={niche} onChange={(e) => setNiche(e.target.value)} />
            <div className="icon-btn"><Bell size={16} />{alerts.length > 0 && <div style={{ position: "absolute", top: 7, right: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--accent-amber)" }} />}</div>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#0B0E13" }}>A</div>
          </div>
        </div>

        {errorMsg && (
          <div className="card" style={{ padding: "10px 14px", marginBottom: 16, borderColor: "var(--accent-red)", fontSize: 12.5, color: "var(--accent-red)" }}>
            {errorMsg}
          </div>
        )}

        {/* Field research + video plan \u2014 the top-level entry point */}
        <div className="hero-card" style={{ marginBottom: 20, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ background: "rgba(255,176,32,0.14)", borderRadius: 9, padding: 7 }}>
              <Compass size={16} color="var(--accent-amber)" />
            </div>
            <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>Start here</div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, margin: "0 0 4px 0" }}>
            Give it any field \u2014 get a full video plan
          </h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            It researches the field on the web, then maps a 5-video roadmap. Script any video in the plan with one click.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: research || loadingStage ? 18 : 0 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 14, padding: "11px 14px" }}
              placeholder="e.g. System Design, DSA for interviews, Android development"
              value={fieldTopic}
              onChange={(e) => setFieldTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && researchAndPlan()}
            />
            <button className="btn" style={{ padding: "11px 20px", fontSize: 13.5 }} onClick={researchAndPlan} disabled={!!loadingStage}>
              {loadingStage ? <Loader2 size={15} className="spin" /> : <Compass size={15} />}
              {loadingStage === "research" ? "Researching field..." : loadingStage === "plan" ? "Building plan..." : "Research & plan"}
            </button>
          </div>

          {research && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{research.summary}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {(research.subtopics || []).map((s, i) => (
                  <span key={i} className="pill" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{s}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10, fontSize: 12 }}>
                <div>
                  <span className="muted" style={{ fontSize: 11 }}>CONTENT GAPS</span>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "var(--text-muted)" }}>
                    {(research.gaps || []).map((g, i) => <li key={i} style={{ marginBottom: 2 }}>{g}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 11 }}>AUDIENCE NEEDS</span>
                  <div style={{ marginTop: 4, color: "var(--text-muted)" }}>{research.audienceNeeds}</div>
                </div>
              </div>
            </div>
          )}

          {videoPlan.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ListChecks size={15} color="var(--accent-amber)" />
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600 }}>5-video roadmap</div>
              </div>
              {videoPlan.map((item) => (
                <div key={item.id} style={{ background: "var(--surface-2)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", width: 18 }}>{item.order}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13 }}>{item.title}</div>
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{item.angle}</div>
                    </div>
                    <span className="pill" style={{ background: item.priority === "High" ? "rgba(110,231,183,0.12)" : "var(--surface)", color: item.priority === "High" ? "var(--accent-mint)" : "var(--text-muted)" }}>{item.priority}</span>
                    <button
                      className="ghost-btn"
                      style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "5px 10px" }}
                      onClick={() => planScripts[item.id] ? setExpandedPlanId(expandedPlanId === item.id ? null : item.id) : generatePlanScript(item)}
                      disabled={loadingPlanScriptId === item.id}
                    >
                      {loadingPlanScriptId === item.id ? <Loader2 size={12} className="spin" /> : planScripts[item.id] ? (expandedPlanId === item.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <FileText size={12} />}
                      {planScripts[item.id] ? "Script" : "Write script"}
                    </button>
                  </div>
                  {expandedPlanId === item.id && planScripts[item.id] && (
                    <div style={{ padding: "4px 14px 14px 44px", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, lineHeight: 1.5 }}>
                      <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>HOOK</span><div>{planScripts[item.id].hook}</div></div>
                      <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>INTRO</span><div>{planScripts[item.id].intro}</div></div>
                      {(planScripts[item.id].sections || []).map((s, i) => (
                        <div key={i}><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{s.heading?.toUpperCase()}</span><div>{s.content}</div></div>
                      ))}
                      <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>CTA</span><div>{planScripts[item.id].cta}</div></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* One-click content package \u2014 quick single-video alternative */}
        <div className="hero-card" style={{ marginBottom: 24, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ background: "rgba(255,176,32,0.14)", borderRadius: 9, padding: 7 }}>
              <Wand2 size={16} color="var(--accent-amber)" />
            </div>
            <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>One click</div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, margin: "0 0 4px 0" }}>
            Idea, thumbnail, script &amp; sources \u2014 all at once
          </h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Give it a topic. It researches the web, then builds the full package in one shot.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: pkg || loadingPackage ? 18 : 0 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 14, padding: "11px 14px" }}
              placeholder="e.g. Spring Boot vs FastAPI for backend beginners"
              value={packageTopic}
              onChange={(e) => setPackageTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generatePackage()}
            />
            <button className="btn" style={{ padding: "11px 20px", fontSize: 13.5 }} onClick={generatePackage} disabled={loadingPackage}>
              {loadingPackage ? <Loader2 size={15} className="spin" /> : <Wand2 size={15} />}
              {loadingPackage ? "Building package..." : "Generate everything"}
            </button>
          </div>

          {pkg && !loadingPackage && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                {[
                  { key: "idea", label: "Idea", icon: Sparkles },
                  { key: "thumbnail", label: "Thumbnail", icon: Image },
                  { key: "script", label: "Script", icon: FileText },
                  { key: "sources", label: "Sources", icon: Link2 },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPkgTab(tab.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8,
                      border: "1px solid var(--border)", cursor: "pointer", fontSize: 12.5, fontFamily: "var(--font-body)",
                      background: pkgTab === tab.key ? "var(--surface-2)" : "transparent",
                      color: pkgTab === tab.key ? "var(--accent-amber)" : "var(--text-muted)",
                    }}
                  >
                    <tab.icon size={13} /> {tab.label}
                  </button>
                ))}
              </div>

              {pkgTab === "idea" && (
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="pill" style={{ background: "rgba(167,139,250,0.12)", color: "var(--accent-violet)" }}>Viral score {pkg.idea?.viral}</span>
                    <span className="pill" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>Demand: {pkg.idea?.demand}</span>
                    <span className="pill" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>Difficulty: {pkg.idea?.difficulty}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{pkg.idea?.title}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>{pkg.idea?.whyPromising}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>Audience: {pkg.idea?.audience}</div>
                </div>
              )}

              {pkgTab === "thumbnail" && (
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {(pkg.thumbnail?.colors || []).map((c, i) => (
                      <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: "1px solid var(--border)" }} title={c} />
                    ))}
                  </div>
                  <div style={{ fontSize: 13.5, marginBottom: 10 }}><span className="muted" style={{ fontSize: 11 }}>OVERLAY TEXT &middot; </span><strong>{pkg.thumbnail?.text}</strong></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10, fontSize: 12.5 }}>
                    <div><span className="muted" style={{ fontSize: 11 }}>LAYOUT</span><div>{pkg.thumbnail?.layout}</div></div>
                    <div><span className="muted" style={{ fontSize: 11 }}>EMOTION</span><div>{pkg.thumbnail?.emotion}</div></div>
                    <div><span className="muted" style={{ fontSize: 11 }}>COMPOSITION</span><div>{pkg.thumbnail?.composition}</div></div>
                  </div>
                </div>
              )}

              {pkgTab === "script" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, lineHeight: 1.55 }}>
                  <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>HOOK</span><div>{pkg.script?.hook}</div></div>
                  <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>INTRO</span><div>{pkg.script?.intro}</div></div>
                  {(pkg.script?.sections || []).map((s, i) => (
                    <div key={i}><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{s.heading?.toUpperCase()}</span><div>{s.content}</div></div>
                  ))}
                  <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>CTA</span><div>{pkg.script?.cta}</div></div>
                </div>
              )}

              {pkgTab === "sources" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(pkg.sources || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                      <Link2 size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12.5 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{s.note}</div>
                      </div>
                    </div>
                  ))}
                  {(!pkg.sources || pkg.sources.length === 0) && <EmptyState text="No sources returned for this topic." />}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Trending opportunities" value={trends.length} icon={Flame} />
          <StatCard label="Competitors tracked" value={competitors.length} icon={Users} />
          <StatCard label="Ideas generated" value={ideas.length} icon={Sparkles} />
          <StatCard label="Calendar entries" value={calendar.length} icon={Clock} />
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Trend Discovery Engine" title="Trending right now" action="Refresh" onAction={refreshTrends} loading={loadingTrends} />
            {trends.length === 0 && !loadingTrends && <EmptyState text="No trends yet - click Refresh to generate opportunities." />}
            {loadingTrends && <EmptyState text="Scanning the niche for current content angles..." />}
            {trends.map((t) => {
              const Icon = getSourceIcon(t.source);
              return (
                <div className="list-row" key={t.id}>
                  <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 7, flexShrink: 0 }}><Icon size={14} color="var(--text-muted)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, marginBottom: 3 }}>{t.topic}</div>
                    <div className="muted" style={{ fontSize: 11.5, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span>{t.source}</span><span>&middot;</span><span>{t.format}</span><span>&middot;</span><span>{t.length}</span>
                    </div>
                  </div>
                  <span className="pill" style={{ background: t.competition === "Low" ? "rgba(110,231,183,0.12)" : t.competition === "Medium" ? "rgba(255,176,32,0.12)" : "rgba(251,113,133,0.12)", color: t.competition === "Low" ? "var(--accent-mint)" : t.competition === "Medium" ? "var(--accent-amber)" : "var(--accent-red)" }}>{t.competition}</span>
                  <SignalMeter value={t.score} tone="amber" />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, width: 26, textAlign: "right" }}>{t.score}</div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="AI Recommendations" title="What to do next" action="Regenerate" onAction={refreshRecommendations} loading={loadingRecs} />
            {recommendations.length === 0 && !loadingRecs && <EmptyState text="Track some trends or competitors, then regenerate for tailored advice." />}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendations.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 10, padding: "11px 12px", background: "var(--surface-2)", borderRadius: 10, borderLeft: `3px solid ${r.kind === "opportunity" ? "var(--accent-mint)" : r.kind === "warning" ? "var(--accent-red)" : "var(--accent-violet)"}` }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Competitor Intelligence" title="Competitor activity" />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Channel name, e.g. Fireship" value={competitorInput} onChange={(e) => setCompetitorInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && trackCompetitor()} />
              <button className="btn" onClick={trackCompetitor} disabled={loadingCompetitor}>
                {loadingCompetitor ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Track
              </button>
            </div>
            {competitors.length === 0 && <EmptyState text="Add a channel name above to research it." />}
            {competitors.map((c) => (
              <div className="list-row" key={c.id}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, flexShrink: 0 }}>{(c.name || "??").slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>{c.name}{c.trend === "up" ? <TrendingUp size={12} color="var(--accent-mint)" /> : <TrendingDown size={12} color="var(--accent-red)" />}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{c.gap}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{c.avgViews}</div>
                  <div className="muted" style={{ fontSize: 10.5 }}>{c.uploadFreq}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Content Calendar" title="This week" />
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <select className="input" value={calDay} onChange={(e) => setCalDay(e.target.value)}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <option key={d}>{d}</option>)}
              </select>
              <select className="input" value={calType} onChange={(e) => setCalType(e.target.value)}>
                {["Tutorial", "Short", "Comparison", "Deep-dive", "Review"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="input" style={{ flex: 1, minWidth: 100 }} placeholder="Video title" value={calTitle} onChange={(e) => setCalTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCalendarEntry()} />
              <button className="btn" onClick={addCalendarEntry}><Plus size={14} /></button>
            </div>
            {calendar.length === 0 && <EmptyState text="Add your first planned video above." />}
            {calendar.map((c) => (
              <div className="list-row" key={c.id}>
                <div style={{ width: 36, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{c.day}</div>
                <div style={{ flex: 1, fontSize: 13 }}>{c.title}</div>
                <span className="pill" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{c.type}</span>
                <X size={14} color="var(--text-muted)" style={{ cursor: "pointer" }} onClick={() => removeCalendarEntry(c.id)} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <SectionHeader eyebrow="Keyword Research" title="Search demand for your niche" />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Topic, e.g. Java DSA interview prep" value={keywordTopic} onChange={(e) => setKeywordTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateKeywords()} />
            <button className="btn" onClick={generateKeywords} disabled={loadingKeywords}>
              {loadingKeywords ? <Loader2 size={14} className="spin" /> : <KeyRound size={14} />} Research
            </button>
          </div>
          {keywords.length === 0 && !loadingKeywords && <EmptyState text="Enter a topic above to research real keywords." />}
          {keywords.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {keywords.map((k) => (
                <div key={k.id} style={{ background: "var(--surface-2)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{k.keyword}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="pill" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>{k.intent}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--accent-mint)" }}>Opp. {k.opportunity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 22 }}>
          <SectionHeader eyebrow="AI Video Idea Generator" title="Fresh video ideas" />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Topic, e.g. Spring Boot vs FastAPI" value={ideaTopic} onChange={(e) => setIdeaTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateIdeas()} />
            <button className="btn" onClick={generateIdeas} disabled={loadingIdeas}>
              {loadingIdeas ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Generate
            </button>
          </div>
          {ideas.length === 0 && !loadingIdeas && <EmptyState text="Enter a topic above and generate real ideas." />}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {ideas.map((idea) => (
              <div className="card" key={idea.id} style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className="pill" style={{ background: "rgba(167,139,250,0.12)", color: "var(--accent-violet)" }}>Viral score {idea.viral}</span>
                  <Target size={14} color="var(--text-muted)" />
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 500 }}>{idea.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                  <span>Demand: {idea.demand}</span><span>Difficulty: {idea.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="AI Title Generator" title="Optimized titles" />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Video topic" value={titleTopic} onChange={(e) => setTitleTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateTitles()} />
              <button className="btn" onClick={generateTitles} disabled={loadingTitles}>
                {loadingTitles ? <Loader2 size={14} className="spin" /> : <Type size={14} />} Generate
              </button>
            </div>
            {titles.length === 0 && !loadingTitles && <EmptyState text="Enter a topic above to generate scored titles." />}
            {titles.map((t) => (
              <div className="list-row" key={t.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{t.title}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{t.style} &middot; CTR score {t.ctr}</div>
                </div>
                <div
                  className="icon-btn"
                  style={{ width: 30, height: 30, cursor: "pointer" }}
                  onClick={() => copyTitle(t.id, t.title)}
                >
                  {copiedTitle === t.id ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Script Assistant" title="Script outline" />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Video title or topic" value={scriptTopic} onChange={(e) => setScriptTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateScript()} />
              <button className="btn" onClick={generateScript} disabled={loadingScript}>
                {loadingScript ? <Loader2 size={14} className="spin" /> : <FileText size={14} />} Draft
              </button>
            </div>
            {!script && !loadingScript && <EmptyState text="Enter a title above to draft a script outline." />}
            {script && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5, lineHeight: 1.55 }}>
                <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>HOOK</span><div>{script.hook}</div></div>
                <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>INTRO</span><div>{script.intro}</div></div>
                {(script.sections || []).map((s, i) => (
                  <div key={i}>
                    <span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{s.heading?.toUpperCase()}</span>
                    <div>{s.content}</div>
                  </div>
                ))}
                <div><span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 }}>CTA</span><div>{script.cta}</div></div>
                {script.chapters && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                    {script.chapters.map((c, i) => <div key={i} className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{c}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Analytics \u2014 sample data" title="Views, last 7 days" />
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 10 }}>Connect your YouTube channel to replace this with real numbers.</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={seedAnalytics}>
                <defs><linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFB020" stopOpacity={0.35} /><stop offset="100%" stopColor="#FFB020" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#232A34" vertical={false} />
                <XAxis dataKey="day" stroke="#8A94A3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A94A3" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="views" stroke="#FFB020" fill="url(#viewsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <SectionHeader eyebrow="Notifications" title="Recent alerts" />
            {alerts.length === 0 && <EmptyState text="Alerts appear here as you refresh trends and track competitors." />}
            {alerts.map((a) => {
              const Icon = a.icon || Flame;
              return (
                <div className="list-row" key={a.id}>
                  <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 7 }}><Icon size={14} color="var(--accent-amber)" /></div>
                  <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
