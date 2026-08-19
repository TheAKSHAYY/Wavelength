import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { initials } from "../lib/format";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  Loader2,
  Sun,
  Moon,
  Settings,
  User,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "system" | "youtube" | "ai";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "YouTube API Connected",
    message: "Channel UC6sFFiZztnKzGrMqwS3rD4w synchronized with live competitor stats.",
    time: "Just now",
    read: false,
    type: "youtube",
  },
  {
    id: "notif-2",
    title: "Title Intelligence Ready",
    message: "Semantic research engine active with 10 psychological frameworks.",
    time: "5m ago",
    read: false,
    type: "ai",
  },
  {
    id: "notif-3",
    title: "Multi-Language Script Assistant",
    message: "Creator-grade scriptwriting enabled for English, Hinglish, and Hindi.",
    time: "10m ago",
    read: true,
    type: "system",
  },
];

import { allNavItems } from "../lib/nav";

const cmdItems = allNavItems;

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("wavelength_theme") || "dark";
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("wavelength_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (cmdOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [cmdOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("wavelength_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("wavelength_notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("wavelength_notifications", JSON.stringify([]));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = cmdItems.filter(
    (item) =>
      item.label.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      (item.group || "").toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const handleCmdSelect = (path: string) => {
    setCmdOpen(false);
    setCmdQuery("");
    navigate(path);
  };

  return (
    <>
      <header className="topbar">
        <button
          className="icon-btn show-on-mobile"
          onClick={onMenuClick}
          aria-label="Open menu"
          title="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="topbar-search" onClick={() => setCmdOpen(true)} style={{ cursor: "pointer" }}>
          <Search size={14} color="var(--text-dim)" />
          <input
            ref={inputRef}
            placeholder="Search tools, topics, commands..."
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
          <kbd>Ctrl K</kbd>
        </div>

        <div className="topbar-actions" style={{ position: "relative" }}>
          {/* Mobile Search Icon */}
          <button
            className="icon-btn show-on-mobile"
            onClick={() => setCmdOpen(true)}
            aria-label="Search tools"
            title="Search tools & commands"
          >
            <Search size={16} />
          </button>

          {/* Theme Toggle */}
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              className="icon-btn"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              title="System Notifications"
              style={{ position: "relative" }}
            >
              <Bell size={16} />
              {unreadCount > 0 && <span className="badge" style={{ background: "var(--accent-primary, #38bdf8)" }} />}
            </button>

            {notifOpen && (
              <div
                className="card dropdown-popover"
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications ({unreadCount})</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ fontSize: 11, background: "none", border: "none", color: "var(--accent-primary, #38bdf8)", cursor: "pointer", fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        style={{ fontSize: 11, background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                  {notifications.length === 0 && (
                    <div style={{ padding: "16px 0", textAlign: "center", fontSize: 12.5, color: "var(--text-dim)" }}>
                      No new notifications
                    </div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: n.read ? "var(--surface-2)" : "rgba(56, 189, 248, 0.08)",
                        border: n.read ? "1px solid var(--border)" : "1px solid rgba(56, 189, 248, 0.25)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{n.title}</span>
                        <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.35 }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <div
              className="avatar"
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              style={{
                cursor: "pointer",
                background: user?.avatar_color || undefined,
                color: "#fff",
                fontWeight: 700,
              }}
              title={user?.email || "Creator Profile"}
            >
              {initials(user?.name || user?.email || "Admin")}
            </div>

            {profileOpen && (
              <div
                className="card dropdown-popover"
                style={{
                  width: "min(280px, calc(100vw - 24px))",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    paddingBottom: 10,
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  <div
                    className="avatar"
                    style={{ background: user?.avatar_color || undefined, color: "#fff", fontWeight: 700 }}
                  >
                    {initials(user?.name || user?.email || "Admin")}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.name || "Creator"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.handle ? `@${user.handle}` : user?.email || "admin@wavelength.local"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, padding: "8px 10px" }}
                  >
                    <User size={14} /> Creator Profile & Persona
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, padding: "8px 10px" }}
                  >
                    <Settings size={14} /> Dashboard Settings
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      toggleTheme();
                    }}
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, padding: "8px 10px" }}
                  >
                    {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, padding: "8px 10px", color: "var(--accent-red, #ef4444)" }}
                  >
                    {loggingOut ? <Loader2 size={14} className="spin" /> : <LogOut size={14} />} Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {cmdOpen && (
        <div className="cmd-overlay" onClick={() => setCmdOpen(false)}>
          <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="cmd-input"
              placeholder="Type a command or search tools..."
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              autoFocus
            />
            <div className="cmd-results">
              {filtered.length === 0 && (
                <div style={{ padding: "12px 16px", color: "var(--text-dim)", fontSize: 13 }}>
                  No results found
                </div>
              )}
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    className="cmd-item"
                    onClick={() => handleCmdSelect(item.path)}
                  >
                    <div className="cmd-item-icon">
                      <Icon size={14} />
                    </div>
                    <span className="cmd-item-label">{item.label}</span>
                    <span className="cmd-item-hint">{item.group}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}