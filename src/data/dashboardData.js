import {
  LayoutGrid,
  Radar,
  Compass,
  Wand2,
  Sparkles,
  Type,
  FileText,
  CalendarDays,
  LineChart as LineChartIcon,
  Users,
  Search,
  Github,
  MessageSquare,
  Newspaper,
  Youtube,
} from "lucide-react";

export const seedAnalytics = [
  { day: "Mon", views: 4200 },
  { day: "Tue", views: 5100 },
  { day: "Wed", views: 4800 },
  { day: "Thu", views: 6700 },
  { day: "Fri", views: 8900 },
  { day: "Sat", views: 11200 },
  { day: "Sun", views: 9600 },
];

export const sourceIcon = {
  "GitHub Trending": Github,
  Reddit: MessageSquare,
  "Hacker News": Newspaper,
  "Product Hunt": Sparkles,
  YouTube: Youtube,
  Web: Search,
};

export const getSourceIcon = (source) => sourceIcon[source] || Search;

export const navGroups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutGrid, label: "Dashboard" },
      { icon: Compass, label: "Field Research & Plan" },
      { icon: Wand2, label: "One-Click Package" },
    ],
  },
  {
    label: "Research",
    items: [
      { icon: Radar, label: "Trend Discovery" },
      { icon: Users, label: "Competitor Intel" },
      { icon: Search, label: "Keyword Research" },
    ],
  },
  {
    label: "Create",
    items: [
      { icon: Sparkles, label: "Idea Generator" },
      { icon: Type, label: "Title Generator" },
      { icon: FileText, label: "Script Assistant" },
    ],
  },
  {
    label: "Plan & Grow",
    items: [
      { icon: CalendarDays, label: "Content Calendar" },
      { icon: LineChartIcon, label: "Analytics" },
    ],
  },
];
