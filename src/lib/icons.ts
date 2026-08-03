import {
  Github,
  MessageSquare,
  Newspaper,
  Sparkles,
  Youtube,
  Search,
  Flame,
  Users,
  Compass,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { AlertKind, TrendSource } from "../types";

const sourceIconMap: Record<TrendSource, LucideIcon> = {
  "GitHub Trending": Github,
  Reddit: MessageSquare,
  "Hacker News": Newspaper,
  "Product Hunt": Sparkles,
  YouTube: Youtube,
  Web: Search,
};

export function getSourceIcon(source: TrendSource | undefined): LucideIcon {
  if (!source) return Search;
  return sourceIconMap[source] || Search;
}

const alertIconMap: Record<AlertKind, LucideIcon> = {
  flame: Flame,
  users: Users,
  compass: Compass,
  wand: Wand2,
};

export function getAlertIcon(kind: AlertKind | undefined): LucideIcon {
  if (!kind) return Flame;
  return alertIconMap[kind] || Flame;
}
