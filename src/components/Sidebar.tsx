import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Settings,
  Menu,
  X,
} from "lucide-react";
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
      <div className="sidebar-brand">
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          W
        </div>
        <span className="sidebar-brand-text">Wavelength</span>
        <button
          className="icon-btn hide-on-mobile"
          style={{ marginLeft: "auto", width: 28, height: 28 }}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
        <button
          className="icon-btn show-on-mobile"
          style={{ marginLeft: "auto", width: 32, height: 32 }}
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

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

      <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 12px" }}>
        <NavLink
          to="/profile"
          className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          title={collapsed ? "Creator Profile" : undefined}
          onClick={() => onMobileClose?.()}
          style={{ padding: collapsed ? "6px" : "6px 8px", borderRadius: "var(--radius-md)" }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: user?.avatar_color || "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(user?.name || user?.email || "Creator")}
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", textAlign: "left", marginLeft: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Creator"}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.handle ? `@${user.handle}` : "View Profile"}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}