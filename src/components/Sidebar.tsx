import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
  const location = useLocation();
  const { user } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        {/* Logo mark */}
        <div
          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0 text-white font-bold text-token-base"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-warm))" }}
        >
          W
        </div>
        <span className="sidebar-brand-text">Wavelength</span>

        {/* Collapse toggle — desktop only */}
        <button
          className="icon-btn hide-on-mobile ml-auto w-7 h-7"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>

        {/* Close button — mobile only */}
        <button
          className="icon-btn show-on-mobile ml-auto w-8 h-8"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() => onMobileClose?.()}
                >
                  <span className="nav-item-icon">
                    <Icon size={16} />
                  </span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.desc && !collapsed && (
                    <span className="nav-item-desc">{item.desc}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — user profile link */}
      <div className="sidebar-footer flex flex-col gap-token-1 px-token-3 py-token-2">
        <NavLink
          to="/profile"
          className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          title={collapsed ? "Creator Profile" : undefined}
          onClick={() => onMobileClose?.()}
          style={{ padding: collapsed ? "6px" : "6px 8px", borderRadius: "var(--radius-md)" }}
        >
          {/* Avatar circle */}
          <div
            className="w-6 h-6 rounded-token-full flex items-center justify-center text-white shrink-0 font-bold"
            style={{
              background: user?.avatar_color || "var(--accent)",
              fontSize: "var(--text-xs)",
            }}
          >
            {initials(user?.name || user?.email || "Creator")}
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden text-left ml-token-1">
              <span className="text-token-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.name || "Creator"}
              </span>
              <span className="text-token-xs text-token-text-muted overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.handle ? `@${user.handle}` : "View Profile"}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}