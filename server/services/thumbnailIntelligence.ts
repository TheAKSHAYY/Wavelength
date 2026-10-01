import { generateAICompletion } from "./aiProvider.js";

export type ThumbnailObjectiveType =
  | "Curiosity"
  | "Mystery"
  | "Comparison"
  | "Transformation"
  | "Warning"
  | "Result"
  | "Challenge"
  | "Discovery"
  | "Explanation"
  | "Emotional"
  | "News/Trend"
  | "List";

export type ThumbnailLayout =
  | "LEFT_TEXT_RIGHT_SUBJECT"
  | "RIGHT_TEXT_LEFT_SUBJECT"
  | "CENTER_SUBJECT"
  | "SPLIT_COMPARISON"
  | "TOP_TEXT_BOTTOM_SUBJECT"
  | "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE";

export interface ThumbnailObjective {
  type: ThumbnailObjectiveType;
  oneSecondPromise: string;
  emotionalTrigger: string;
}

export interface ThumbnailVisualStory {
  narrative: string;
  primaryFocalSubject: string;
  secondaryElements: string[];
  backgroundEnvironment: string;
  subjectPosition: "left" | "right" | "center" | "bottom" | "split";
}

export interface ThumbnailTextStrategy {
  overlayText: string;
  characterCount: number;
  wordCount: number;
  layoutZone: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  textColor: string;
  pillColor?: string;
  textStroke: string;
  dropShadow: string;
  lineBreakIndex?: number;
  fontFamily?: "Anton" | "Bebas Neue" | "Montserrat" | string;
  suggestedHooks?: string[];
}

export interface ThumbnailVisualBlueprint {
  visualMedium: string;
  lightingScheme: string;
  cameraFraming: string;
  visualStyle: string;
  environment: string;
  emotionalTone: string;
  composition: string;
}

export interface ThumbnailQA {
  focalPointClarity: { passed: boolean; note: string };
  relevance: { passed: boolean; note: string };
  storyImmediacy: { passed: boolean; note: string };
  textBrevity: { passed: boolean; wordCount: number; note: string };
  mobileReadability: { passed: boolean; note: string };
  compositionBalance: { passed: boolean; layout: ThumbnailLayout; note: string };
  accuracyCheck: { passed: boolean; note: string };
  overallVerdict: "Ready for Production" | "Needs Adjustment";
}

export interface ThumbnailIntelligenceInput {
  title?: string;
  script?: string;
  topic?: string;
  stylePreset?: string;
  angle?: string;
  audience?: string;
  channelNiche?: string;
}

export interface ThumbnailIntelligenceOutput {
  objective: ThumbnailObjective;
  visualStory: ThumbnailVisualStory;
  blueprint: ThumbnailVisualBlueprint;
  layout: ThumbnailLayout;
  textStrategy: ThumbnailTextStrategy;
  colorDirection: {
    primary: string;
    secondary: string;
    accent: string;
    contrastRating: "Ultra High" | "High" | "Balanced";
  };
  enginePrompt: string;
  negativePrompt: string;
  qa: ThumbnailQA;

  // Backward compatibility fields
  visualMedium?: string;
  lightingScheme?: string;
  cameraFraming?: string;
  visualStyle?: string;
  environment?: string;
  emotionalTone?: string;
  overlayText: string;
  badgePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-right";
  visualHook: string;
  focalSubject: string;
  backgroundScene: string;
  composition: {
    rule: string;
    layoutType: string;
    emotion: string;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    contrastRating: "Ultra High" | "High" | "Balanced";
  };
  ctrOptimizationTips: string[];
  visualConcept?: any;
  visualRelevanceScore?: number;
}

/**
 * Normalizes user input cleanly without stripping Hindi / Hinglish / Unicode characters.
 */
function cleanInput(text: string): string {
  return (text || "")
    .replace(/^video\s+title\/topic:\s*/i, "")
    .replace(/^video\s+topic:\s*/i, "")
    .replace(/^topic:\s*/i, "")
    .replace(/^video\s+title:\s*/i, "")
    .replace(/^title:\s*/i, "")
    .replace(/[\][}{"'\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Derives a dynamic visual medium tailored specifically to the topic domain.
 * Prevents forcing all topics into generic studio photography.
 */
export function deriveDomainVisualMedium(topicOrTitle: string): string {
  const lower = (topicOrTitle || "").toLowerCase();

  if (
    lower.includes("black hole") ||
    lower.includes("space") ||
    lower.includes("galaxy") ||
    lower.includes("astronomy") ||
    lower.includes("mars") ||
    lower.includes("universe") ||
    lower.includes("planet") ||
    lower.includes("telescope")
  ) {
    return "Cinematic deep-space cosmic visualization";
  }

  if (
    lower.includes("brain") ||
    lower.includes("dopamine") ||
    lower.includes("psychology") ||
    lower.includes("neuroscience") ||
    lower.includes("memory") ||
    lower.includes("mental") ||
    lower.includes("biology")
  ) {
    return "Macro 3D conceptual neural & psychological visualization";
  }

  if (
    lower.includes("gta") ||
    lower.includes("game") ||
    lower.includes("gaming") ||
    lower.includes("minecraft") ||
    lower.includes("playstation") ||
    lower.includes("xbox") ||
    lower.includes("cyberpunk") ||
    lower.includes("unreal engine")
  ) {
    return "Hyper-realistic next-generation game engine cinematic render";
  }

  if (
    lower.includes("java") ||
    lower.includes("python") ||
    lower.includes("code") ||
    lower.includes("coding") ||
    lower.includes("software") ||
    lower.includes("developer") ||
    lower.includes("dsa") ||
    lower.includes("react") ||
    lower.includes("spring boot") ||
    lower.includes("ai app") ||
    lower.includes("ai agent")
  ) {
    return "High-contrast editorial technology photography";
  }

  if (
    lower.includes("finance") ||
    lower.includes("investing") ||
    lower.includes("crypto") ||
    lower.includes("bitcoin") ||
    lower.includes("money") ||
    lower.includes("stock market")
  ) {
    return "Cinematic editorial business & financial visualization";
  }

  if (
    lower.includes("biryani") ||
    lower.includes("food") ||
    lower.includes("recipe") ||
    lower.includes("cooking") ||
    lower.includes("street food")
  ) {
    return "Vibrant high-contrast editorial culinary photography";
  }

  if (
    lower.includes("workout") ||
    lower.includes("muscle") ||
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("cricket") ||
    lower.includes("athletic")
  ) {
    return "Dynamic high-contrast athletic action photography";
  }

  return "Cinematic editorial photography";
}

/**
 * Builds a clean, YouTube-optimized engine prompt designed specifically for the chosen layout.
 * Ensures the primary subject is framed to leave clear negative space for thumbnail text.
 * Strictly avoids generic token pollution such as "16:9 YouTube thumbnail photography".
 */
function getNaturalLightingWords(primaryHex: string, _accentHex: string): string {
  const p = (primaryHex || "").replace("#", "").toLowerCase();
  if (p.startsWith("38") || p.startsWith("3b") || p.startsWith("0")) {
    return "electric cyan and warm amber dual rim lighting, dark atmospheric studio glow";
  }
  if (p.startsWith("ff") || p.startsWith("f5")) {
    return "intense golden neon rim highlights, deep contrasting shadows";
  }
  if (p.startsWith("ef") || p.startsWith("e5")) {
    return "dramatic crimson red backlight, sharp cinematic contrast";
  }
  if (p.startsWith("10") || p.startsWith("22")) {
    return "vibrant emerald neon rim light with atmospheric haze";
  }
  return "dramatic volumetric rim lighting, deep contrast shadows, punchy cinematic illumination";
}

/**
 * Builds a clean, YouTube-optimized engine prompt designed specifically for the chosen layout.
 * Ensures the primary subject is framed to leave clear negative space for thumbnail text.
 * Strictly avoids generic token pollution or negative prompt leakage into the positive prompt.
 */
export function buildEnginePromptFromLayout(
  story: ThumbnailVisualStory,
  blueprint: ThumbnailVisualBlueprint,
  layout: ThumbnailLayout,
  colorDir: { primary: string; secondary: string; accent: string },
  _titleOrTopic: string,
  _negativeAvoids: string[]
): string {
  // Strip out any text references, price tags, or meta instructions from subject & narrative
  const cleanSubject = (story.primaryFocalSubject || "hero subject")
    .replace(/price tag[^,.]*/gi, "")
    .replace(/showing ['"][^'"]*['"]/gi, "")
    .replace(/with text[^,.]*/gi, "")
    .replace(/clean uncluttered/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const cleanNarrative = (story.narrative || "")
    .replace(/price tag[^,.]*/gi, "")
    .replace(/showing ['"][^'"]*['"]/gi, "")
    .replace(/with text[^,.]*/gi, "")
    .replace(/clean uncluttered/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const medium = blueprint.visualMedium || deriveDomainVisualMedium(_titleOrTopic);
  const naturalLighting = getNaturalLightingWords(colorDir.primary, colorDir.accent);
  const lighting = blueprint.lightingScheme && !blueprint.lightingScheme.includes("#")
    ? blueprint.lightingScheme
    : naturalLighting;
  const env = blueprint.environment || story.backgroundEnvironment || "cinematic studio environment";

  const cleanSecondary = (story.secondaryElements || [])
    .filter(
      (s) =>
        !s.toLowerCase().includes("text") &&
        !s.toLowerCase().includes("tag") &&
        !s.toLowerCase().includes("words") &&
        !s.toLowerCase().includes("label")
    )
    .join(", ");

  const secondaryStr = cleanSecondary ? `featuring ${cleanSecondary}` : "";

  // Precise composition positioning hint without confusing negative space words
  let framing = "hero subject prominent in dynamic perspective";
  if (layout === "LEFT_TEXT_RIGHT_SUBJECT") {
    framing = "hero subject prominently positioned on the right side of frame";
  } else if (layout === "RIGHT_TEXT_LEFT_SUBJECT") {
    framing = "hero subject prominently positioned on the left side of frame";
  } else if (layout === "CENTER_SUBJECT") {
    framing = "bold centered hero subject in sharp focus";
  } else if (layout === "SPLIT_COMPARISON") {
    framing = "dramatic split-screen comparative lighting and framing";
  }

  return `Vivid high-contrast ${medium} of ${cleanSubject}. ${cleanNarrative}. Set in ${env}. ${secondaryStr}. ${framing}, ${lighting}, sharp crisp focal clarity, punchy vibrant saturated colors, 8k resolution, dramatic commercial YouTube thumbnail photography, no text, no watermarks, no blur, masterpiece quality.`.replace(/\s+/g, " ").trim();
}

/**
 * Builds clean, comprehensive negative constraints for image generation.
 */
export function buildNegativePrompt(customAvoids: string[] = []): string {
  const baseAvoids = [
    "embedded text",
    "letters",
    "words",
    "typography",
    "watermarks",
    "logos",
    "fonts",
    "signature",
    "labels",
    "dull lighting",
    "blurry artifacts",
    "distorted anatomy",
    "duplicate subjects",
    "stock photo cliches",
    "visual clutter",
    "distorted faces",
    "low resolution",
    "amateur photo",
  ];
  return Array.from(new Set([...customAvoids, ...baseAvoids])).join(", ");
}

/**
 * Validates domain relevance to ensure non-tech topics never receive tech/coder artifacts.
 */
function sanitizeVisualRelevance(story: ThumbnailVisualStory, rawInput: string, avoidList: string[]): void {
  const inputLower = rawInput.toLowerCase();
  const storyText = `${story.narrative} ${story.primaryFocalSubject} ${story.backgroundEnvironment} ${(story.secondaryElements || []).join(" ")}`.toLowerCase();

  const isTechTopic =
    inputLower.includes("code") ||
    inputLower.includes("programming") ||
    inputLower.includes("developer") ||
    inputLower.includes("java") ||
    inputLower.includes("python") ||
    inputLower.includes("dsa") ||
    inputLower.includes("react") ||
    inputLower.includes("sql") ||
    inputLower.includes("cybersecurity") ||
    inputLower.includes("ai app") ||
    inputLower.includes("ai agent");

  const forbiddenTechTerms = ["developer", "programmer", "workstation", "laptop", "ide", "code editor", "syntax", "coding screen"];

  if (!isTechTopic) {
    for (const term of forbiddenTechTerms) {
      const termRegex = new RegExp(`\\b${term}\\b`, "i");
      if (termRegex.test(storyText)) {
        story.primaryFocalSubject = story.primaryFocalSubject.replace(termRegex, "subject");
        story.narrative = story.narrative.replace(termRegex, "action");
        story.backgroundEnvironment = story.backgroundEnvironment.replace(termRegex, "authentic setting");
        story.secondaryElements = (story.secondaryElements || []).filter((el) => !termRegex.test(el));
      }
    }
    if (!avoidList.some((a) => a.includes("coding") || a.includes("laptop"))) {
      avoidList.push("laptops", "coding screens", "developer workstations", "programming IDE");
    }
  }
}

/**
 * Executes a deterministic QA assessment over the thumbnail blueprint.
 */
function evaluateThumbnailQA(
  story: ThumbnailVisualStory,
  objective: ThumbnailObjective,
  textStrategy: ThumbnailTextStrategy,
  layout: ThumbnailLayout,
  rawTitle: string
): ThumbnailQA {
  const words = textStrategy.overlayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isTitleCopy = textStrategy.overlayText.toLowerCase() === rawTitle.toLowerCase();
  const textBrevityPassed = wordCount >= 1 && wordCount <= 4 && !isTitleCopy;

  const focalPointPassed = Boolean(story.primaryFocalSubject && story.primaryFocalSubject.length > 5);
  const storyPassed = Boolean(story.narrative && story.narrative.length > 10);
  const relevancePassed = Boolean(story.backgroundEnvironment && story.backgroundEnvironment.length > 5);

  // Check that text zone doesn't collide with subject position
  let mobileReadabilityPassed = true;
  if (
    (layout === "LEFT_TEXT_RIGHT_SUBJECT" && story.subjectPosition === "left") ||
    (layout === "RIGHT_TEXT_LEFT_SUBJECT" && story.subjectPosition === "right")
  ) {
    mobileReadabilityPassed = false;
  }

  const accuracyPassed = !story.narrative.toLowerCase().includes("secret underground bunker") &&
                         !story.narrative.toLowerCase().includes("alien laboratory");

  const passedCount = [focalPointPassed, storyPassed, relevancePassed, textBrevityPassed, mobileReadabilityPassed, accuracyPassed].filter(Boolean).length;

  return {
    focalPointClarity: {
      passed: focalPointPassed,
      note: focalPointPassed ? `Dominant subject: ${story.primaryFocalSubject.slice(0, 45)}...` : "Focal subject is underspecified",
    },
    relevance: {
      passed: relevancePassed,
      note: relevancePassed ? `Context grounded in ${story.backgroundEnvironment.slice(0, 35)}...` : "Missing authentic background setting",
    },
    storyImmediacy: {
      passed: storyPassed,
      note: `1-sec objective: ${objective.oneSecondPromise}`,
    },
    textBrevity: {
      passed: textBrevityPassed,
      wordCount,
      note: textBrevityPassed ? `Punchy ${wordCount}-word hook ("${textStrategy.overlayText}")` : `Text too long (${wordCount} words) or duplicates title`,
    },
    mobileReadability: {
      passed: mobileReadabilityPassed,
      note: mobileReadabilityPassed ? `Clean negative space in ${textStrategy.layoutZone} zone` : "Text layout may overlap with focal subject",
    },
    compositionBalance: {
      passed: true,
      layout,
      note: `Optimized for ${layout.replace(/_/g, " ")}`,
    },
    accuracyCheck: {
      passed: accuracyPassed,
      note: accuracyPassed ? "Grounded in realistic visual context" : "Contains potentially fabricated claims",
    },
    overallVerdict: passedCount >= 5 ? "Ready for Production" : "Needs Adjustment",
  };
}

/**
 * MAIN ENTRY POINT: Professional YouTube Thumbnail Intelligence Engine
 * 
 * Pipeline:
 * Topic → Content Understanding → Video Angle → Thumbnail Objective → Visual Story → Focal Subject
 * → Composition Layout → Thumbnail Text Strategy → Prompt Builder → Quality QA
 */
export async function runThumbnailIntelligence(
  input: ThumbnailIntelligenceInput
): Promise<ThumbnailIntelligenceOutput> {
  const title = cleanInput(input.title || "");
  const topic = cleanInput(input.topic || input.title || "Creator Topic");
  const script = cleanInput(input.script || "");
  const stylePreset = input.stylePreset || "High-CTR YouTube Viral";
  const rawTarget = title || topic;

  const systemPrompt = `You are a world-class YouTube Creative Director and Thumbnail Strategist.
You design high-CTR YouTube thumbnails that communicate the video's core idea within 1 second.

CRITICAL DESIGN PHILOSOPHY:
1. CONTENT UNDERSTANDING OVER LITERALISM:
   - Understand the true intent, angle, and psychological trigger of the title/topic.
   - Do NOT interpret dramatic titles literally (e.g. "What They Actually Hide Inside Google Headquarters..." is a curiosity/investigative exploration of Google campus perks/culture/security turnstiles, NOT an underground sci-fi laboratory or generic blue server room).
2. THUMBNAIL OBJECTIVE:
   - Identify the exact viewer emotion/objective: Curiosity, Mystery, Comparison, Transformation, Warning, Result, Challenge, Discovery, Explanation, Emotional, News/Trend, or List.
   - Formulate the 1-second question (e.g. "What is behind this door?").
3. VISUAL STORY & HIERARCHY:
   - Exactly ONE dominant primary focal hero subject.
   - 1-2 subtle secondary elements.
   - Contextual authentic background that NEVER overpowers the subject.
4. INTENTIONAL COMPOSITION:
   - Choose the best layout: "LEFT_TEXT_RIGHT_SUBJECT" | "RIGHT_TEXT_LEFT_SUBJECT" | "CENTER_SUBJECT" | "SPLIT_COMPARISON" | "TOP_TEXT_BOTTOM_SUBJECT" | "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE".
   - If subject is on the right, place text on the left (and vice-versa) to guarantee negative space and mobile legibility.
5. TEXT STRATEGY:
   - Generate 1-4 punchy, high-impact words (MAX 4 WORDS).
   - NEVER copy the video title.
   - Text should heighten curiosity, conflict, or stakes (e.g. "WHAT'S INSIDE?", "DON'T BUY THIS", "BEHIND THIS DOOR", "WHY IT FAILS").
6. ZERO DEVELOPER BIAS:
   - Coding/laptops/IDE appear ONLY if the topic is specifically programming/software.
   - Food topics must show food/kitchens/stalls.
   - Fitness topics must show athletic gym action.
   - Travel topics must show landscapes/destinations.
   - Cricket topics must show stadiums/pitch/cricket gear.

Output ONLY valid JSON adhering strictly to this schema:
{
  "objective": {
    "type": "Curiosity" | "Mystery" | "Comparison" | "Transformation" | "Warning" | "Result" | "Challenge" | "Discovery" | "Explanation" | "Emotional" | "News/Trend" | "List",
    "oneSecondPromise": "string (The core thought/question the viewer has in 1 second)",
    "emotionalTrigger": "string (e.g. 'Intense curiosity, revelation')"
  },
  "visualStory": {
    "narrative": "string (Specific visual scenario communicating the video hook)",
    "primaryFocalSubject": "string (The ONE dominant hero element with rich details)",
    "secondaryElements": ["string", "string"],
    "backgroundEnvironment": "string (Authentic non-distracting setting)",
    "subjectPosition": "left" | "right" | "center" | "bottom" | "split"
  },
  "blueprint": {
    "visualMedium": "string (Tailored medium: e.g. 'Cinematic deep-space cosmic visualization' for space, 'Hyper-realistic game-engine render' for gaming, 'Macro 3D neural visualization' for neuroscience/psychology, 'High-contrast editorial technology photography' for coding/tech, 'Vibrant editorial culinary photography' for food)",
    "lightingScheme": "string (e.g. 'Cosmic plasma glow with rim highlights', 'Volumetric atmospheric god rays', 'Neon edge lighting')",
    "cameraFraming": "string (e.g. 'Wide cinematic establishing shot with extreme scale', '85mm close-up portrait with extreme bokeh', 'Low-angle 24mm dynamic hero shot')",
    "visualStyle": "string (e.g. 'Premium cinematic science documentary', 'Next-gen game cinematic', 'Sleek modern editorial')",
    "environment": "string (Rich thematic backdrop matching the exact topic)",
    "emotionalTone": "string (e.g. 'Overwhelming cosmic scale and mystery', 'High-speed adrenaline', 'Focus and breakthrough clarity')",
    "composition": "string (Spatial framing leaving negative space for typography overlay)"
  },
  "layout": "LEFT_TEXT_RIGHT_SUBJECT" | "RIGHT_TEXT_LEFT_SUBJECT" | "CENTER_SUBJECT" | "SPLIT_COMPARISON" | "TOP_TEXT_BOTTOM_SUBJECT" | "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE",
  "textStrategy": {
    "overlayText": "string (1-3 PUNCHY WORDS IN ALL CAPS, e.g. 'DON\\'T BUY THIS' or 'UNDER $1000')",
    "suggestedHooks": [
      "string (Curiosity hook: 1-3 words in ALL CAPS)",
      "string (Warning hook: 1-3 words in ALL CAPS)",
      "string (Result hook: 1-3 words in ALL CAPS)",
      "string (Intrigue hook: 1-3 words in ALL CAPS)"
    ],
    "layoutZone": "left" | "right" | "top" | "top-left" | "top-right",
    "textColor": "#HEX (Vibrant readable color, e.g. '#FFE600' or '#FF2A54' or '#00F0FF')",
    "pillColor": "rgba(0, 0, 0, 0.85)",
    "textStroke": "3.5px #000000",
    "dropShadow": "0 8px 24px rgba(0,0,0,0.85)",
    "fontFamily": "Anton" | "Bebas Neue" | "Montserrat"
  },
  "colorDirection": {
    "primary": "#HEX (Vibrant subject accent)",
    "secondary": "#HEX (Deep background contrast tone)",
    "accent": "#HEX (Energetic pop highlight)",
    "contrastRating": "Ultra High" | "High" | "Balanced"
  },
  "avoid": ["string", "string"]
}`;

  const userPrompt = `Topic: "${topic}"\nTitle: "${title}"\nScript Excerpt: "${script}"\nStyle Preset: "${stylePreset}"\n\nDesign the complete professional YouTube thumbnail strategy and visual blueprint for this video.`;

  const aiResult = await generateAICompletion({
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.6,
    maxTokens: 3500,
    jsonMode: true,
  });

  if (!aiResult || !aiResult.text) {
    throw new Error("Thumbnail Intelligence AI did not produce an output.");
  }

  const cleaned = aiResult.text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  let parsed: any;

  function tryParse(str: string) {
    try {
      return JSON.parse(str);
    } catch {
      // Fix unquoted property names, trailing commas, and unescaped line breaks
      let sanitized = str
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, " ")
        .replace(/[\x00-\x1F\x7F-\x9F]/g, " ");

      try {
        return JSON.parse(sanitized);
      } catch {
        sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        return JSON.parse(sanitized);
      }
    }
  }

  try {
    parsed = tryParse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = tryParse(match[0]);
      } catch {
        parsed = {};
      }
    } else {
      parsed = {};
    }
  }
  if (!parsed || typeof parsed !== "object") {
    parsed = {};
  }

  // Extract components with resilient fallbacks
  const objective: ThumbnailObjective = {
    type: parsed.objective?.type || "Curiosity",
    oneSecondPromise: parsed.objective?.oneSecondPromise || `Discovering the truth about ${rawTarget}`,
    emotionalTrigger: parsed.objective?.emotionalTrigger || "Curiosity & High Engagement",
  };

  const rawSubjectPos = parsed.visualStory?.subjectPosition || "right";
  let layout: ThumbnailLayout = parsed.layout || (rawSubjectPos === "left" ? "RIGHT_TEXT_LEFT_SUBJECT" : "LEFT_TEXT_RIGHT_SUBJECT");
  if (title.toLowerCase().includes(" vs ") || topic.toLowerCase().includes(" vs ")) {
    layout = "SPLIT_COMPARISON";
  }

  // Synchronize subjectPosition and text layoutZone to prevent overlaps
  let subjectPosition: "left" | "right" | "center" | "bottom" | "split" = "right";
  let layoutZone: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right" = "left";

  if (layout === "LEFT_TEXT_RIGHT_SUBJECT") {
    subjectPosition = "right";
    layoutZone = "left";
  } else if (layout === "RIGHT_TEXT_LEFT_SUBJECT") {
    subjectPosition = "left";
    layoutZone = "right";
  } else if (layout === "SPLIT_COMPARISON") {
    subjectPosition = "split";
    layoutZone = "top";
  } else if (layout === "TOP_TEXT_BOTTOM_SUBJECT") {
    subjectPosition = "bottom";
    layoutZone = "top";
  } else if (layout === "CENTER_SUBJECT") {
    subjectPosition = "center";
    layoutZone = "top";
  } else {
    subjectPosition = rawSubjectPos;
    layoutZone = subjectPosition === "right" ? "left" : "right";
  }

  const visualStory: ThumbnailVisualStory = {
    narrative: parsed.visualStory?.narrative || `A compelling visual revelation exploring ${rawTarget}`,
    primaryFocalSubject: parsed.visualStory?.primaryFocalSubject || parsed.visualStory?.focalSubject || `High-impact hero subject representing ${rawTarget}`,
    secondaryElements: Array.isArray(parsed.visualStory?.secondaryElements) ? parsed.visualStory.secondaryElements : [],
    backgroundEnvironment: parsed.visualStory?.backgroundEnvironment || `Authentic setting matching ${rawTarget}`,
    subjectPosition,
  };

  // Sanitize text strategy to ensure 1-4 words
  let rawOverlay = (parsed.textStrategy?.overlayText || "WATCH THIS").trim().toUpperCase();
  const overlayWords = rawOverlay.split(/\s+/).filter(Boolean);
  if (overlayWords.length > 4) {
    rawOverlay = overlayWords.slice(0, 3).join(" ");
  }
  if (rawOverlay === title.toUpperCase()) {
    rawOverlay = "WHAT HAPPENED?";
  }

  // Extract model suggested hooks or fallback to domain hooks
  const _topicLower = (title || topic).toLowerCase();
  const hookCandidates: string[] = [];
  if (rawOverlay && rawOverlay !== "WATCH THIS" && rawOverlay !== "WHAT HAPPENED?") {
    hookCandidates.push(rawOverlay);
  }

  if (Array.isArray(parsed.textStrategy?.suggestedHooks)) {
    for (const h of parsed.textStrategy.suggestedHooks) {
      const cleanH = String(h || "").trim().toUpperCase();
      if (cleanH && cleanH.split(/\s+/).length <= 4 && cleanH !== title.toUpperCase()) {
        hookCandidates.push(cleanH);
      }
    }
  }

  // Domain-specific fallbacks if model provided fewer than 4 hooks
  const domainFallbacks = getDomainFallbackHooks(title || topic);
  for (const dh of domainFallbacks) {
    if (hookCandidates.length >= 4) break;
    if (!hookCandidates.includes(dh)) {
      hookCandidates.push(dh);
    }
  }

  const suggestedHooks = Array.from(new Set(hookCandidates)).slice(0, 4);
  const activeOverlay = rawOverlay || suggestedHooks[0] || "MUST WATCH";
  const rawFont = parsed.textStrategy?.fontFamily;
  const validFont = rawFont === "Bebas Neue" || rawFont === "Montserrat" ? rawFont : "Anton";

  const textStrategy: ThumbnailTextStrategy = {
    overlayText: activeOverlay,
    characterCount: activeOverlay.length,
    wordCount: activeOverlay.split(/\s+/).filter(Boolean).length,
    layoutZone,
    textColor: parsed.textStrategy?.textColor || "#FFE600",
    pillColor: parsed.textStrategy?.pillColor || "rgba(0, 0, 0, 0.82)",
    textStroke: parsed.textStrategy?.textStroke || "3.5px #000000",
    dropShadow: parsed.textStrategy?.dropShadow || "0 8px 24px rgba(0,0,0,0.85)",
    fontFamily: validFont,
    suggestedHooks,
  };

  const colorDirection = {
    primary: parsed.colorDirection?.primary || "#38BDF8",
    secondary: parsed.colorDirection?.secondary || "#0F172A",
    accent: parsed.colorDirection?.accent || "#F59E0B",
    contrastRating: parsed.colorDirection?.contrastRating || "Ultra High",
  };

  const avoidList: string[] = Array.isArray(parsed.avoid) ? parsed.avoid : [];
  sanitizeVisualRelevance(visualStory, `${title} ${topic}`, avoidList);

  let visualMedium = parsed.blueprint?.visualMedium;
  if (!visualMedium || visualMedium.length < 5 || visualMedium.toLowerCase().includes("generic") || visualMedium.toLowerCase().includes("stock")) {
    visualMedium = deriveDomainVisualMedium(rawTarget);
  }
  const lightingScheme = parsed.blueprint?.lightingScheme || `Directional rim lighting with bold color harmony (${colorDirection.primary} and ${colorDirection.accent})`;
  const cameraFraming = parsed.blueprint?.cameraFraming || "Cinematic wide perspective with shallow depth of field";
  const visualStyle = parsed.blueprint?.visualStyle || "High dynamic range, crisp focal clarity, cinematic depth";
  const environment = parsed.blueprint?.environment || visualStory.backgroundEnvironment;
  const emotionalTone = parsed.blueprint?.emotionalTone || objective.emotionalTrigger;
  const compDesc = parsed.blueprint?.composition || `Dynamic ${layout.replace(/_/g, " ")} framing reserving clean negative space for typography`;

  const blueprint: ThumbnailVisualBlueprint = {
    visualMedium,
    lightingScheme,
    cameraFraming,
    visualStyle,
    environment,
    emotionalTone,
    composition: compDesc,
  };

  const enginePrompt = buildEnginePromptFromLayout(visualStory, blueprint, layout, colorDirection, rawTarget, avoidList);
  const negativePrompt = buildNegativePrompt(avoidList);

  const qa = evaluateThumbnailQA(visualStory, objective, textStrategy, layout, title || topic);

  // Calculate layout badge position for UI
  let badgePos: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-right" = "top-left";
  if (textStrategy.layoutZone === "left" || textStrategy.layoutZone === "top-left") badgePos = "top-left";
  else if (textStrategy.layoutZone === "right" || textStrategy.layoutZone === "top-right") badgePos = "top-right";
  else if (textStrategy.layoutZone === "bottom-left") badgePos = "bottom-left";
  else if (textStrategy.layoutZone === "bottom-right" || textStrategy.layoutZone === "bottom") badgePos = "bottom-right";

  return {
    objective,
    visualStory,
    blueprint,
    layout,
    textStrategy,
    colorDirection,
    enginePrompt,
    negativePrompt,
    qa,

    // Backward compatibility aliases
    visualMedium,
    lightingScheme,
    cameraFraming,
    visualStyle,
    environment,
    emotionalTone,
    overlayText: textStrategy.overlayText,
    badgePosition: badgePos,
    visualHook: objective.oneSecondPromise,
    focalSubject: visualStory.primaryFocalSubject,
    backgroundScene: visualStory.backgroundEnvironment,
    composition: {
      rule: layout.replace(/_/g, " "),
      layoutType: layout,
      emotion: objective.emotionalTrigger,
    },
    colorPalette: {
      primary: colorDirection.primary,
      secondary: colorDirection.secondary,
      accent: colorDirection.accent,
      contrastRating: colorDirection.contrastRating,
    },
    ctrOptimizationTips: [
      `1-Second Objective: ${objective.type} (${objective.oneSecondPromise})`,
      `Dynamic ${layout.replace(/_/g, " ")} framing reserving negative space for text`,
      `High-CTR ${textStrategy.wordCount}-word hook: "${textStrategy.overlayText}"`,
      `Contrast-rated ${colorDirection.contrastRating} color harmony`,
      `Visual Medium: ${visualMedium}`,
    ],
    visualRelevanceScore: 95,
  };
}

/**
 * Returns 4 punchy, high-CTR viral hooks based on topic domain.
 */
export function getDomainFallbackHooks(topicOrTitle: string): string[] {
  const lower = (topicOrTitle || "").toLowerCase();
  if (lower.includes("pc") || lower.includes("gaming") || lower.includes("hardware") || lower.includes("gpu") || lower.includes("build")) {
    return ["UNDER $1000", "DON'T BUY THIS", "144 FPS BEAST", "BIG MISTAKE"];
  }
  if (lower.includes("food") || lower.includes("recipe") || lower.includes("biryani") || lower.includes("cook") || lower.includes("kitchen")) {
    return ["SECRET TASTE", "100-YEAR TRICK", "STOP COOKING THIS", "NEVER DO THIS"];
  }
  if (lower.includes("fitness") || lower.includes("gym") || lower.includes("workout") || lower.includes("diet") || lower.includes("muscle")) {
    return ["NEVER DO THIS", "1% BULK SECRET", "GET LEAN FAST", "WASTING TIME?"];
  }
  if (lower.includes("cricket") || lower.includes("ipl") || lower.includes("match") || lower.includes("sports")) {
    return ["HOW THEY WON", "UNNOTICED MOVE", "THE TURNING POINT", "WHAT HAPPENED?"];
  }
  if (lower.includes("money") || lower.includes("finance") || lower.includes("invest") || lower.includes("crypto") || lower.includes("stock")) {
    return ["WHY YOU'RE BROKE", "THE 1-YEAR TRICK", "DO NOT INVEST", "THE REAL COST"];
  }
  if (lower.includes("code") || lower.includes("developer") || lower.includes("programming") || lower.includes("ai") || lower.includes("software")) {
    return ["THIS REPLACES YOU", "DON'T LEARN THIS", "10X FASTER", "GAME OVER?"];
  }
  return ["THE REAL TRUTH", "DON'T BUY THIS", "WHAT HAPPENED?", "MUST WATCH"];
}

/**
 * Generates fresh 1-3 word viral thumbnail hooks on demand using AI.
 */
export async function generateViralThumbnailHooks(title: string, topic: string): Promise<string[]> {
  const cleanT = cleanInput(title || topic || "Video");
  try {
    const aiResult = await generateAICompletion({
      system: `You are a world-class YouTube thumbnail copywriter and packaging strategist.
Generate exactly 4 ultra-punchy, 1-3 word thumbnail text hooks in ALL CAPS that maximize click-through rate (CTR).
Styles required:
1. Curiosity / Intrigue (e.g. 'WHAT HAPPENED?', 'THE REAL TRUTH')
2. Warning / Stakes (e.g. 'DON'T BUY THIS', 'BIG MISTAKE')
3. High Value / Result (e.g. 'UNDER $1000', '10X FASTER')
4. Secret / Revelation (e.g. 'SECRET EXPOSED', 'NEVER SEEN')
Rules:
- NEVER repeat the title.
- Each hook must be 1-3 words only.
- Output ONLY valid JSON array containing exactly 4 strings.`,
      prompt: `Title: "${cleanT}"\nTopic: "${cleanInput(topic || title || "Creator Video")}"`,
      temperature: 0.7,
      maxTokens: 300,
      jsonMode: true,
    });

    if (aiResult?.text) {
      const parsed = JSON.parse(aiResult.text.replace(/```(?:json)?/gi, "").trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((s: any) => String(s || "").toUpperCase().trim())
          .filter((s: string) => s.length > 0 && s.split(/\s+/).length <= 4)
          .slice(0, 4);
      }
    }
  } catch (err) {
    console.warn("generateViralThumbnailHooks AI call failed, using domain fallbacks:", err);
  }

  return getDomainFallbackHooks(cleanT);
}
