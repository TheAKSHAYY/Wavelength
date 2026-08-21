import {
  LayoutGrid,
  Compass,
  FolderGit2,
  Layers,
  FileText,
  Clapperboard,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  desc?: string;
  group?: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Home",
    items: [
      { label: "Home", path: "/", icon: LayoutGrid, desc: "Command Center & Next Move", group: "Home" },
    ],
  },
  {
    label: "Studio",
    items: [
      { label: "Shorts Studio", path: "/shorts", icon: Clapperboard, desc: "9:16 vertical short production blueprints", group: "Studio", badge: "HOT" },
      { label: "Thumbnail Studio", path: "/packaging", icon: Layers, desc: "10-framework titles & synchronized thumbnails", group: "Studio" },
      { label: "Long-Form Studio", path: "/script", icon: FileText, desc: "Retention-optimized video scripts & beats", group: "Studio" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", path: "/projects", icon: FolderGit2, desc: "Unified idea & video blueprints", group: "Workspace" },
      { label: "Research", path: "/research", icon: Compass, desc: "Keywords, gaps & audience signals", group: "Workspace" },
      { label: "Creator Profile", path: "/profile", icon: User, desc: "Master persona, tone & channel memory", group: "Workspace" },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);
