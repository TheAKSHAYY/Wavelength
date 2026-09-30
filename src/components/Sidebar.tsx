import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Zap } from "lucide-react";
import { navGroups } from "../lib/nav";
import { useStore } from "../lib/store";
import { initials } from "../lib/format";

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose?: () => void;
}) {
  const { user } = useStore();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("wavelength_sidebar_collapsed") === "1"
  );
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("wavelength_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <div
          className="sidebar-brand-logo"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          {collapsed ? "W" : <Zap size={17} strokeWidth={2.5} />}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="sidebar-brand-text">Wavelength</div>
            <div className="sidebar-brand-sub">Creator Studio</div>
          </div>
        )}

        <button
          className="icon-btn hide-on-mobile"
          style={{ width: 28, height: 28, marginLeft: "auto", flexShrink: 0 }}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        <button
          className="icon-btn show-on-mobile"
          style={{ width: 32, height: 32, marginLeft: "auto" }}
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="sidebar-nav" aria-label="Studio navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                  onClick={() => onMobileClose?.()}
                >
                  <span className="nav-item-icon" aria-hidden="true">
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="nav-item-label">{item.label}</span>
                      {item.badge && (
                        <span
                          className="pill pill-indigo"
                          style={{ marginLeft: "auto", fontSize: 9, padding: "2px 7px" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 10px",
            textDecoration: "none",
          }}
          title={collapsed ? "Creator Profile" : undefined}
          onClick={() => onMobileClose?.()}
        >
          <div
            className="avatar"
            style={{
              width: 30,
              height: 30,
              fontSize: 10,
              flexShrink: 0,
              background:
                user?.avatar_color ||
                "linear-gradient(135deg, var(--grad-a), var(--grad-b))",
            }}
            aria-hidden="true"
          >
            {initials(user?.name || user?.email || "C")}
          </div>

          {!collapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                overflow: "hidden",
                textAlign: "left",
                gap: 1,
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}
              >
                {user?.name || "Creator"}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--text-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user?.handle ? `@${user.handle}` : "View Profile"}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}