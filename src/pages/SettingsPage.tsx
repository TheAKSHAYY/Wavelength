import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Youtube,
  Cpu,
  Trash2,
  Check,
  Moon,
  Sun,
  ShieldCheck,
  Database,
  RefreshCw,
  Globe,
  User,
  ArrowRight,
} from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("wavelength_theme") || "dark";
  });
  const [defaultLang, setDefaultLang] = useState(() => {
    return localStorage.getItem("wavelength_default_lang") || "English";
  });
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("wavelength_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSaveDefaults = () => {
    localStorage.setItem("wavelength_default_lang", defaultLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear cached creator state and reload?")) {
      const token = localStorage.getItem("wavelength_token");
      const userStr = localStorage.getItem("wavelength_user");
      localStorage.clear();
      if (token) localStorage.setItem("wavelength_token", token);
      if (userStr) localStorage.setItem("wavelength_user", userStr);
      setCleared(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--accent-primary, #38bdf8)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            SYSTEM PREFERENCES
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Dashboard Settings
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Manage your YouTube API connections, AI model preferences, and dashboard defaults
        </p>
      </div>

      {/* 0. Creator Profile Quick Link */}
      <Link
        to="/profile"
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textDecoration: "none",
          color: "inherit",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), var(--surface-2))",
          border: "1px solid rgba(99, 102, 241, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: 10, borderRadius: "var(--radius-md)", background: "rgba(99, 102, 241, 0.15)", color: "var(--accent)" }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>Creator Profile & Persona</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Edit your channel name, bio, social profiles, niche, and security credentials</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--accent-primary)", fontWeight: 600 }}>
          Manage Profile <ArrowRight size={14} />
        </div>
      </Link>

      {/* 1. Connected Integrations Card */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ padding: 8, borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
            <Youtube size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>YouTube Data API Integration</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Active connection for live competitor and keyword research</div>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11.5,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: "rgba(52, 211, 153, 0.15)",
              color: "var(--accent-mint, #34d399)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ShieldCheck size={13} /> Active & Connected
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12, marginTop: 4 }}>
          <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Active Channel ID</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>
              UC6sFFiZztnKzGrMqwS3rD4w
            </div>
          </div>

          <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>API Quota Status</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-mint, #34d399)", marginTop: 4 }}>
              Healthy (200 OK Live Queries)
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Intelligence Engines */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: "var(--radius-sm)", background: "rgba(56, 189, 248, 0.12)", color: "var(--accent-primary, #38bdf8)" }}>
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>AI Intelligence Pipeline</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Multi-tier engine with real YouTube data synthesis fallback</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Title Intelligence Engine</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>10 distinct frameworks, semantic parsing, 8-factor heuristic scoring</div>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--accent-mint)", fontWeight: 700 }}>v2.4 Production</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Script Assistant Engine</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Creator-grade spoken narration, Hinglish/Hindi/English, zero contamination</div>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--accent-mint)", fontWeight: 700 }}>v2.4 Production</span>
          </div>
        </div>
      </div>

      {/* 3. Appearance & Preferences */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: "var(--radius-sm)", background: "rgba(251, 191, 36, 0.12)", color: "var(--accent-amber, #fbbf24)" }}>
            <Globe size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Display & Language Preferences</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Configure your default creator language and dashboard theme</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Dashboard Theme
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => toggleTheme("dark")}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: theme === "dark" ? "var(--surface-3)" : "var(--surface-2)",
                  border: theme === "dark" ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                  color: theme === "dark" ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Moon size={14} /> Dark Mode
              </button>

              <button
                onClick={() => toggleTheme("light")}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: theme === "light" ? "var(--surface-3)" : "var(--surface-2)",
                  border: theme === "light" ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                  color: theme === "light" ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Sun size={14} /> Light Mode
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Default Script Language
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["English", "Hinglish", "Hindi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setDefaultLang(lang)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "var(--radius-md)",
                    background: defaultLang === lang ? "var(--accent-primary-dim, rgba(56, 189, 248, 0.15))" : "var(--surface-2)",
                    border: defaultLang === lang ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                    color: defaultLang === lang ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: defaultLang === lang ? 700 : 500,
                    fontSize: 12.5,
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSaveDefaults} className="btn" style={{ padding: "8px 18px", fontSize: 12.5 }}>
            {saved ? <Check size={13} color="var(--accent-mint)" /> : <RefreshCw size={13} />}
            {saved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* 4. Local Cache & Reset */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
            <Database size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Storage & Cache Management</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Reset generated state or clear local cache if needed</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Clear Creator Cache</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Clears stored ideas, titles, and scripts while preserving login</div>
          </div>
          <button
            onClick={handleClearCache}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Trash2 size={13} /> {cleared ? "Cache Cleared!" : "Reset Cache"}
          </button>
        </div>
      </div>
    </div>
  );
}
