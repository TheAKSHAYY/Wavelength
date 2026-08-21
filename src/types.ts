export type Competition = "Low" | "Medium" | "High";
export type Demand = "Low" | "Medium" | "High";
export type Difficulty = "Low" | "Medium" | "High";
export type Priority = "High" | "Medium" | "Low";
export type Intent = "Informational" | "Comparison" | "Tutorial" | "Commercial";
export type RecommendationKind = "opportunity" | "warning" | "insight";
export type AlertKind = "flame" | "users" | "compass" | "wand";
export type TrendSource =
  | "GitHub Trending"
  | "Reddit"
  | "Hacker News"
  | "Product Hunt"
  | "YouTube"
  | "Web";

export interface Trend {
  id: string;
  topic: string;
  source: TrendSource;
  score: number;
  growth: number;
  competition: Competition;
  format: string;
  length: string;
}

export interface Idea {
  id: string;
  title: string;
  viral: number;
  demand: Demand;
  difficulty: Difficulty;
  audience: string;
}

export interface Competitor {
  id: string;
  name: string;
  uploadFreq: string;
  avgViews: string;
  trend: "up" | "down";
  lastVideo: string;
  gap: string;
}

export interface Recommendation {
  id: string;
  text: string;
  kind: RecommendationKind;
}

export interface CalendarEntry {
  id: string;
  day: string;
  type: string;
  title: string;
}

export interface Alert {
  id: string;
  text: string;
  time: string;
  kind: AlertKind;
}

export interface Title {
  id: string;
  rank?: number;
  title: string;
  angle?: string;
  style?: string;
  ctrPotential?: "Very High" | "High" | "Medium" | "Low";
  ctr?: number;
  score?: number;
  whyItWorks?: string;
}

export interface TitleResearchMetadata {
  topic: string;
  audience: string;
  researchStatus: "Research-backed" | "AI-generated from topic knowledge" | "Limited research available";
  opportunity: string;
  observedAngles: string[];
}

export interface Keyword {
  id: string;
  keyword: string;
  intent: Intent;
  difficulty: Difficulty;
  opportunity: number;
}

export interface ScriptSection {
  heading: string;
  purpose?: string;
  keyPoints?: string[];
  retentionOpportunity?: string;
  content: string;
}

export interface Script {
  mode?: "outline" | "full";
  title?: string;
  topic?: string;
  audience?: string;
  language?: "English" | "Hindi" | "Hinglish";
  duration?: string;
  format?: string;
  hook: string;
  intro: string;
  sections: ScriptSection[];
  cta: string;
  chapters?: string[];
  qualityScore?: {
    relevance: number;
    retention: number;
    naturalness: number;
    overall: number;
  };
}

export interface ContentPackage {
  idea: {
    title: string;
    viral: number;
    demand: Demand;
    difficulty: Difficulty;
    audience: string;
    whyPromising: string;
  };
  thumbnail: {
    layout: string;
    text: string;
    colors: string[];
    emotion: string;
    composition: string;
  };
  script: Script;
  sources: Array<{ name: string; note: string }>;
}

export interface FieldResearch {
  summary: string;
  subtopics: string[];
  gaps: string[];
  audienceNeeds: string;
}

export interface VideoPlanItem {
  id: string;
  order: number;
  title: string;
  angle: string;
  format: string;
  priority: Priority;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  discord?: string;
  website?: string;
  linkedin?: string;
  youtube?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  channel_name?: string;
  handle?: string;
  bio?: string;
  avatar_url?: string;
  avatar_color?: string;
  niche?: string;
  target_audience?: string;
  tone?: string;
  youtube_channel_id?: string;
  upload_goal?: string;
  social_links?: SocialLinks;
  created_at?: string;
}

export type ProjectType = "Short" | "Thumbnail" | "Full Video";
export type ProjectStatus = "Draft" | "Researching" | "Writing" | "Packaged" | "Ready to Record" | "Published";

export interface ProjectPackaging {
  recommendedTitle?: string;
  whyRecommended?: string;
  selectedTitle?: string;
  titles?: Array<{ framework: string; title: string; score: number; trigger: string }>;
  visualBlueprint?: {
    subject: string;
    visualMedium: string;
    lightingScheme: string;
    cameraFraming: string;
    visualStyle: string;
    environment: string;
    emotionalTone: string;
    composition: string;
    colorPalette: string;
    enginePrompt: string;
    negativePrompt?: string;
  };
  renderedImageUrl?: string;
  variants?: string[];
  overlayText?: string;
  overlayBadge?: string;
}

export interface ProjectResearch {
  topic: string;
  angle?: string;
  summary?: string;
  verifiedFacts?: Array<{ claim: string; source: string; status: "Verified" | "Contextual" }>;
  contentGaps?: string[];
  burningQuestions?: string[];
}

export interface ProjectLongForm {
  title: string;
  hook: string;
  intro: string;
  sections: Array<{ id: string; heading: string; goal: string; spokenVoiceover: string; visualCue: string }>;
  cta: string;
  estimatedMinutes: number;
}

export interface Project {
  id: string;
  title: string;
  topic: string;
  contentType: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
  
  targetAudience?: string;
  language?: "English" | "Hindi" | "Hinglish";
  tone?: string;
  creatorMode?: ShortsCreatorMode;
  visualStyle?: string;
  
  research?: ProjectResearch;
  packaging?: ProjectPackaging;
  longFormScript?: ProjectLongForm;
  shorts?: ShortsBlueprintOutput[];
}

export interface AppState {
  niche: string;
  currentProjectId?: string | null;
  projects: Project[];
  savedIdeas: Idea[];
  trends: Trend[];
  ideas: Idea[];
  competitors: Competitor[];
  recommendations: Recommendation[];
  calendar: CalendarEntry[];
  alerts: Alert[];
  titles: Title[];
  script: Script | null;
  pkg: ContentPackage | null;
  keywords: Keyword[];
  research: FieldResearch | null;
  videoPlan: VideoPlanItem[];
  planScripts: Record<string, Script>;
}

export interface VideoStat {
  title: string;
  views: number;
  publishedAt: string;
}

export type ShortsCreatorMode =
  | "Personal Creator"
  | "Educator"
  | "Storyteller"
  | "Commentary"
  | "Explainer"
  | "Experiment"
  | "Faceless Creator"
  | "Tutorial";

export type ShortsDuration = "15s" | "30s" | "45s" | "60s";

export type ShortsProductionMethod =
  | "SHOOT YOURSELF"
  | "SCREEN RECORD"
  | "B-ROLL"
  | "AI IMAGE"
  | "AI VIDEO"
  | "MOTION GRAPHIC"
  | "STOCK FOOTAGE";

export interface ShortsHookOption {
  id: string;
  hookText: string;
  type: "Curiosity" | "Contradiction" | "Surprising Statement" | "Direct Question" | "Story Opening" | "Observation" | "Visual Hook";
  whyItWorks: string;
}

export interface ShortsScene {
  sceneNumber: number;
  timeRange: string;
  voiceover: string;
  visual: string;
  shotType: string;
  productionMethod: ShortsProductionMethod;
  onScreenText?: {
    text: string;
    style: "Hook Headline" | "Keyword Badge" | "Stat Callout" | "Minimal";
    emphasisWords: string[];
  };
  bRollOrAsset?: string;
  editingNote: string;
  sfx: string;
  musicCue: string;
  aiImagePrompt?: string;
  aiVideoPrompt?: string;
}

export interface ShortsBlueprintOutput {
  topic: string;
  platform: string;
  strategy: {
    contentAngle: string;
    whyThisAngleWorks: string;
    targetAudience: string;
    goal: string;
    tone: string;
    creatorMode: ShortsCreatorMode;
    estimatedWords: number;
    pacing: string;
  };
  research?: {
    isResearchBacked: boolean;
    verifiedFacts: Array<{ claim: string; source: string; status: "Verified" | "Contextual" }>;
    interpretations: Array<{ point: string; reasoning: string }>;
    creativeHooks: string[];
    keySources: Array<{ title: string; url?: string; publisher?: string }>;
  };
  hooks: {
    options: ShortsHookOption[];
    selectedHookId: string;
    selectedHookText: string;
    selectionRationale: string;
  };
  script: {
    fullVoiceover: string;
    wordCount: number;
    estimatedSeconds: number;
    durationFormatted: string;
  };
  timeline: ShortsScene[];
  editing: {
    pacing: string;
    cutFrequency: string;
    transitions: string[];
    captionStrategy: {
      style: "Word-by-word active bounce" | "Two-line clean sans" | "Minimal punchy keywords";
      colorScheme: { active: string; default: string };
      highlightKeywords: string[];
    };
    audioDirection: {
      voiceStyle: string;
      musicGenre: string;
      musicMood: string;
      targetBpm: number;
      intensityCurve: string;
      sfxList: Array<{ time: string; sfx: string; purpose: string }>;
    };
  };
  production: {
    beforeRecording: string[];
    duringRecording: string[];
    afterRecording: string[];
  };
  finalAiEditorPrompt: string;
  qualityAssessment: {
    humanTestPassed: boolean;
    specificityScore: number;
    durationAccuracy: boolean;
    realismVerdict: string;
  };
}

