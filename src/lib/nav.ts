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
  Settings,
  Image,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  desc?: string;
  group?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutGrid, desc: "Creator overview", group: "Navigation" },
      { label: "AI Chat", path: "/chat", icon: Sparkles, desc: "YouTube Strategist AI", group: "Navigation" },
    ],
  },
  {
    label: "Analyze",
    items: [
      { label: "Trend Discovery", path: "/trends", icon: Radar, desc: "Live viral trends", group: "Analyze" },
      { label: "Competitor Intel", path: "/competitors", icon: Users, desc: "Channel teardowns & gaps", group: "Analyze" },
      { label: "Keyword Research", path: "/keywords", icon: Search, desc: "High-demand search terms", group: "Analyze" },
      { label: "Field Research", path: "/field-research", icon: Compass, desc: "5-video roadmap blueprint", group: "Analyze" },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Idea Generator", path: "/ideas", icon: Sparkles, desc: "Viral video concepts", group: "Create" },
      { label: "Title Generator", path: "/titles", icon: Type, desc: "Research-backed 10 frameworks", group: "Create" },
      { label: "Script Assistant", path: "/script", icon: FileText, desc: "Multi-language creator scripts", group: "Create" },
      { label: "Image Generator", path: "/image-generator", icon: Image, desc: "16:9 YouTube Thumbnails", group: "Create" },
      { label: "One-Click Package", path: "/package", icon: Wand2, desc: "Idea, script & visual suite", group: "Create" },
    ],
  },
  {
    label: "Plan & System",
    items: [
      { label: "Content Calendar", path: "/calendar", icon: CalendarDays, desc: "Schedule uploads", group: "Plan" },
      { label: "Analytics", path: "/analytics", icon: LineChart, desc: "Channel performance stats", group: "Plan" },
      { label: "Creator Profile", path: "/profile", icon: User, desc: "Channel persona & brand", group: "System" },
      { label: "Settings", path: "/settings", icon: Settings, desc: "API status & preferences", group: "System" },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);
