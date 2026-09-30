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
  Clapperboard,
  FileText,
  X,
  Sparkles,
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
  const { user, logout, createProject, setCurrentProject } = useStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Short" | "Full Video">("Short");
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

  const handleLaunchNewVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTitle.trim() || (newType === "Short" ? "New Short Video" : "New Full Video");
    const proj = createProject({
      title: clean,
      topic: clean,
      contentType: newType,
      language: "English",
      tone: user?.tone || "Direct & Punchy",
      targetAudience: user?.target_audience || "YouTube Viewers",
    });
    setCurrentProject(proj.id);
    setCreateModalOpen(false);
    setNewTitle("");

    if (newType === "Short") {
      navigate("/shorts", { state: { projectId: proj.id, topic: proj.topic, title: proj.title } });
    } else {
      navigate("/packaging", { state: { projectId: proj.id, topic: proj.topic, title: proj.title } });
    }
  };

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
          {/* Credits remaining in JetBrains Mono */}
          <div
            className="hide-on-mobile"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>42</span> credits
          </div>

          {/* Plan badge */}
          <span
            className="hide-on-mobile"
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 6,
              background: "rgba(255, 107, 74, 0.12)",
              color: "var(--accent)",
              border: "1px solid rgba(255, 107, 74, 0.25)",
              letterSpacing: "0.06em",
            }}
          >
            PRO
          </span>

          {/* Upgrade Button */}
          <a
            href="/#pricing"
            className="btn btn-secondary hide-on-mobile"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
            }}
          >
            Upgrade
          </a>

          {/* Quick New Video Button (Secondary to avoid competing with page primary CTA) */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: "6px 14px",
              fontSize: "var(--text-xs, 12px)",
              fontWeight: 600,
              gap: 6,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <span>+</span> New Video
          </button>

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
                className="dropdown-popover"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  left: "auto",
                  width: 320,
                  minWidth: 300,
                  maxWidth: "calc(100vw - 24px)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 500,
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
                className="dropdown-popover"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  left: "auto",
                  width: 280,
                  minWidth: 280,
                  maxWidth: "calc(100vw - 24px)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 500,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "4px 6px 10px 6px",
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
                    style={{
                      background: user?.avatar_color || undefined,
                      color: "#fff",
                      fontWeight: 700,
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                    }}
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

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="dropdown-menu-item"
                  >
                    <User size={15} color="var(--accent-primary)" /> Creator Profile & Persona
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="dropdown-menu-item"
                  >
                    <Settings size={15} /> Dashboard Settings
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      toggleTheme();
                    }}
                    className="dropdown-menu-item"
                  >
                    {theme === "dark" ? <Sun size={15} color="var(--accent-amber)" /> : <Moon size={15} color="var(--accent-primary)" />}{" "}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="dropdown-menu-item danger"
                  >
                    {loggingOut ? <Loader2 size={15} className="spin" /> : <LogOut size={15} />} Log Out
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

      {/* Quick New Video Modal */}
      {createModalOpen && (
        <div className="cmd-overlay" onClick={() => setCreateModalOpen(false)}>
          <div
            className="cmd-palette"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540, padding: "26px 28px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" }}>Start a New Video</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                  Choose your format and concept to launch the production studio
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setCreateModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLaunchNewVideo} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Content Format
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setNewType("Short")}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: newType === "Short" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: newType === "Short" ? "rgba(255, 107, 74, 0.12)" : "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(255, 107, 74, 0.18)",
                        color: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clapperboard size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Shorts (9:16)</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>15–60s hook & fast script</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType("Full Video")}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: newType === "Full Video" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: newType === "Full Video" ? "rgba(99, 102, 241, 0.12)" : "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(14, 165, 233, 0.2)",
                        color: "var(--accent-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Full Video (16:9)</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Long-form & packaging</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Video Topic or Concept
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Why Senior Developers Write Less Code"
                  autoFocus
                  style={{
                    width: "100%",
                    height: 46,
                    padding: "0 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: 6 }}
                >
                  <Sparkles size={14} /> Launch Studio →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}