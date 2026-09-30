import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Thumbnail Studio", href: "#thumbnail-studio" },
  { label: "Shorts Studio", href: "#shorts-studio" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--wl-bg)",
        borderBottom: "1px solid var(--wl-border)",
      }}
    >
      <div
        className="wl-container"
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: 40,
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "-0.025em",
            color: "var(--wl-text)",
            flexShrink: 0,
          }}
        >
          Wavelength
        </a>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex",
            gap: 32,
            flex: 1,
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                color: "var(--wl-muted)",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--wl-text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--wl-muted)")
              }
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div
          className="hidden md:flex"
          style={{ gap: 10, alignItems: "center", marginLeft: "auto" }}
        >
          <button
            className="wl-btn wl-btn-ghost"
            onClick={() => handleNav("/auth")}
          >
            Log in
          </button>
          <button
            className="wl-btn wl-btn-primary"
            onClick={() => handleNav("/auth")}
          >
            Start free
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "var(--wl-muted)",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--wl-border)",
            background: "var(--wl-bg)",
            padding: "16px 24px 24px",
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                display: "block",
                padding: "14px 0",
                color: "var(--wl-muted)",
                fontSize: 15,
                fontWeight: 500,
                borderBottom: "1px solid var(--wl-border)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              className="wl-btn wl-btn-ghost"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => handleNav("/auth")}
            >
              Log in
            </button>
            <button
              className="wl-btn wl-btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => handleNav("/auth")}
            >
              Start free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
