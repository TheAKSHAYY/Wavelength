import { NavLink } from "react-router-dom";
import { Zap, Clapperboard, Layers, Compass, FolderGit2, type LucideIcon } from "lucide-react";

interface BottomNavItem {
  path: string;
  aliases?: string[];
  label: string;
  icon: LucideIcon;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    path: "/",
    aliases: ["/app"],
    label: "Dashboard",
    icon: Zap,
  },
  {
    path: "/shorts",
    aliases: ["/app/shorts", "/shorts-studio"],
    label: "Shorts",
    icon: Clapperboard,
  },
  {
    path: "/packaging",
    aliases: ["/app/thumbnail", "/package", "/thumbnails"],
    label: "Thumbnail",
    icon: Layers,
  },
  {
    path: "/research",
    aliases: ["/app/strategy", "/competitors", "/trends"],
    label: "Strategy",
    icon: Compass,
  },
  {
    path: "/projects",
    aliases: ["/app/library"],
    label: "Library",
    icon: FolderGit2,
  },
];

export default function BottomNav() {
  return (
    <nav
      className="bottom-nav show-on-mobile"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(58px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "var(--surface-1)",
        borderTop: "1px solid var(--border)",
        zIndex: 75,
        alignItems: "stretch",
        justifyContent: "space-around",
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "active" : ""}`
            }
            style={({ isActive }) => ({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              transition: "color 150ms cubic-bezier(0, 0, 0.2, 1)",
              minWidth: 0,
              padding: "4px 2px",
              position: "relative",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 24,
                      height: 2,
                      background: "var(--accent)",
                      borderRadius: "0 0 2px 2px",
                    }}
                  />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
