export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Thumbnail Studio", href: "#thumbnail-studio" },
    { label: "Shorts Studio", href: "#shorts-studio" },
    { label: "Pricing", href: "#pricing" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "mailto:hello@wavelength.in" },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--wl-border)",
        padding: "40px 0",
      }}
    >
      <div
        className="wl-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.02em",
            color: "var(--wl-muted)",
          }}
        >
          Wavelength
        </span>

        {/* Links */}
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 24px",
          }}
        >
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 13,
                color: "var(--wl-muted)",
                textDecoration: "none",
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

        {/* Copyright */}
        <p
          style={{
            fontSize: 12,
            color: "var(--wl-border)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          © {year} Wavelength
        </p>
      </div>
    </footer>
  );
}
