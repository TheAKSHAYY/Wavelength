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

export interface AppState {
  niche: string;
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
