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
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutGrid, desc: "Command center & active video", group: "Overview" },
      { label: "Projects Pipeline", path: "/projects", icon: FolderGit2, desc: "All in-progress & filmed videos", group: "Overview" },
    ],
  },
  {
    label: "Studios",
    items: [
      { label: "Shorts Studio", path: "/shorts", icon: Clapperboard, desc: "9:16 vertical video & hook blueprints", group: "Studios" },
      { label: "Thumbnail & Titles", path: "/packaging", icon: Layers, desc: "High-CTR title formulas & thumbnail design", group: "Studios" },
      { label: "Script Studio", path: "/script", icon: FileText, desc: "Retention-structured video scripts", group: "Studios" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { label: "Topic Research", path: "/research", icon: Compass, desc: "Keywords, trends & competitor gaps", group: "Strategy" },
      { label: "Channel Persona", path: "/profile", icon: User, desc: "Creator identity, tone & channel DNA", group: "Strategy" },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);
