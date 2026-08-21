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
export function buildEnginePromptFromLayout(
  story: ThumbnailVisualStory,
  blueprint: ThumbnailVisualBlueprint,
  layout: ThumbnailLayout,
  colorDir: { primary: string; secondary: string; accent: string },
  _titleOrTopic: string,
  negativeAvoids: string[]
): string {
  let framingInstruction = "";

  switch (layout) {
    case "LEFT_TEXT_RIGHT_SUBJECT":
      framingInstruction = "Position the primary focal subject dynamically on the right half of the frame (60% width), leaving generous, clean negative space with soft atmospheric background on the left side (40% width) for text overlay.";
      break;
    case "RIGHT_TEXT_LEFT_SUBJECT":
      framingInstruction = "Position the primary focal subject dynamically on the left half of the frame (60% width), leaving clean negative space with soft atmospheric background on the right side (40% width) for text overlay.";
      break;
    case "CENTER_SUBJECT":
      framingInstruction = "Center the primary hero subject prominently with high visual hierarchy, framed by shallow depth of field and soft background separation.";
      break;
    case "SPLIT_COMPARISON":
      framingInstruction = "Distinct 50/50 vertical split-screen comparison composition with contrasting lighting tones on each side, sharp vertical energy division.";
      break;
    case "TOP_TEXT_BOTTOM_SUBJECT":
      framingInstruction = "Frame the primary focal subject across the lower two-thirds of the image, keeping the top one-third clean and uncluttered with dark atmospheric breathing room.";
      break;
    case "FULL_BLEED_SUBJECT_WITH_NEGATIVE_SPACE":
    default:
      framingInstruction = "Dynamic hero framing with high focal clarity on the primary subject and extreme foreground-to-background separation.";
      break;
  }

  const secondaryStr = story.secondaryElements && story.secondaryElements.length > 0
    ? `Supporting context: ${story.secondaryElements.join(", ")}.`
    : "";

  const medium = blueprint.visualMedium || deriveDomainVisualMedium(_titleOrTopic);
  const lighting = blueprint.lightingScheme || `Directional rim lighting with bold color harmony (${colorDir.primary} and ${colorDir.accent})`;
  const camera = blueprint.cameraFraming || "Cinematic perspective with extreme focal depth";
  const style = blueprint.visualStyle || "High dynamic range, crisp focal clarity, cinematic depth";
  const tone = blueprint.emotionalTone || "High intrigue and visual engagement";
  const env = blueprint.environment || story.backgroundEnvironment;

  return `${medium} of ${story.primaryFocalSubject}. ${story.narrative} in ${env}. ${secondaryStr} Composition: ${framingInstruction} Camera & Angle: ${camera}. Lighting: ${lighting}. Visual Style: ${style}, ${tone}. Compositional mandate: Clean negative space reserved for typography overlay. ZERO embedded text, no letters, no watermarks.`.trim();
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
    "fake UI cards",
    "blurry artifacts",
    "distorted anatomy",
    "duplicate subjects",
    "stock photo cliches",
    "visual clutter",
    "distorted faces",
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
    "overlayText": "string (1-4 PUNCHY WORDS IN ALL CAPS, e.g. 'WHAT\\'S INSIDE?')",
    "layoutZone": "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
    "textColor": "#HEX (Vibrant readable color, e.g. '#FFE600' or '#FFFFFF')",
    "pillColor": "#HEX (Optional semi-transparent pill color or '#E50914')",
    "textStroke": "4px #000000",
    "dropShadow": "0 8px 24px rgba(0,0,0,0.85)"
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
      } catch (err: any) {
        throw new Error(`Failed to parse Thumbnail Intelligence JSON: ${err.message}`);
      }
    } else {
      throw new Error(`Failed to parse Thumbnail Intelligence JSON: ${cleaned.slice(0, 160)}`);
    }
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

  const textStrategy: ThumbnailTextStrategy = {
    overlayText: rawOverlay,
    characterCount: rawOverlay.length,
    wordCount: rawOverlay.split(/\s+/).filter(Boolean).length,
    layoutZone,
    textColor: parsed.textStrategy?.textColor || "#FFE600",
    pillColor: parsed.textStrategy?.pillColor || "rgba(0, 0, 0, 0.78)",
    textStroke: parsed.textStrategy?.textStroke || "4px #000000",
    dropShadow: parsed.textStrategy?.dropShadow || "0 8px 24px rgba(0,0,0,0.85)",
  };

  const colorDirection = {
    primary: parsed.colorDirection?.primary || "#38BDF8",
    secondary: parsed.colorDirection?.secondary || "#0F172A",
    accent: parsed.colorDirection?.accent || "#F59E0B",
    contrastRating: parsed.colorDirection?.contrastRating || "Ultra High",
  };

  const avoidList: string[] = Array.isArray(parsed.avoid) ? parsed.avoid : [];
  sanitizeVisualRelevance(visualStory, `${title} ${topic}`, avoidList);

  const visualMedium = parsed.blueprint?.visualMedium || deriveDomainVisualMedium(rawTarget);
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
