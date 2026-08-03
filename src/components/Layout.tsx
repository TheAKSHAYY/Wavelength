import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Menu, X, LogOut, Radar, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { navGroups } from "../lib/nav";
import { greeting, initials } from "../lib/format";

export default function Layout() {
  const { user, state, setState, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  const nav = (
    <>
      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Radar size={15} color="#0B0E13" strokeWidth={2.5} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Wavelength</div>
          <button className="icon-btn sidebar-close" onClick={closeMenu} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        {nav}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-mint)" }} />
              <span style={{ fontSize: 12 }}>Live AI research active</span>
            </div>
            <div className="muted" style={{ fontSize: 11 }}>Data saved to your account</div>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="overlay" onClick={closeMenu} />}

      <main className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={16} />
            </button>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, margin: 0 }}>
                {greeting(user?.name || "creator")}
              </h1>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                {state.trends.length || state.ideas.length
                  ? "Your research is live — refresh any panel for fresh results."
                  : "Refresh trends or generate ideas to get started."}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              className="input"
              style={{ width: 260, maxWidth: "40vw" }}
              placeholder="Niche, e.g. coding on YouTube"
              value={state.niche}
              onChange={(e) => setState({ niche: e.target.value })}
            />
            <div className="icon-btn">
              <Bell size={16} />
              {state.alerts.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 8,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent-amber)",
                  }}
                />
              )}
            </div>
            <button
              className="icon-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Log out"
              aria-label="Log out"
            >
              {loggingOut ? <Loader2 size={15} className="spin" /> : <LogOut size={15} />}
            </button>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "var(--accent-violet)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 600,
                color: "#0B0E13",
              }}
            >
              {initials(user?.name || "creator")}
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
