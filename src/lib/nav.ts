import {
  LayoutGrid,
  Compass,
  Wand2,
  Radar,
  Users,
  Search,
  Sparkles,
  Type,
  FileText,
  CalendarDays,
  LineChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutGrid },
      { label: "Field Research & Plan", path: "/field-research", icon: Compass },
      { label: "One-Click Package", path: "/package", icon: Wand2 },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Trend Discovery", path: "/trends", icon: Radar },
      { label: "Competitor Intel", path: "/competitors", icon: Users },
      { label: "Keyword Research", path: "/keywords", icon: Search },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Idea Generator", path: "/ideas", icon: Sparkles },
      { label: "Title Generator", path: "/titles", icon: Type },
      { label: "Script Assistant", path: "/script", icon: FileText },
    ],
  },
  {
    label: "Plan & Grow",
    items: [
      { label: "Content Calendar", path: "/calendar", icon: CalendarDays },
      { label: "Analytics", path: "/analytics", icon: LineChart },
    ],
  },
];

export function useNav(): NavGroup[] {
  return navGroups;
}
