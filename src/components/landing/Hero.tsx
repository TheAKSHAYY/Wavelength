import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";

// ── Browser Window Mock ───────────────────────────────────────────────────────
// A real HTML/CSS mock of the Thumbnail Studio UI — no image.
function BrowserMock() {
  return (
    <div
      style={{
        border: "1px solid var(--wl-border)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--wl-surface)",
        width: "100%",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "var(--wl-elevated)",
          borderBottom: "1px solid var(--wl-border)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {(["var(--wl-error)", "var(--wl-warning)", "var(--wl-success)"] as const).map(
            (color, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.8,
                }}
              />
            )
          )}
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            maxWidth: 360,
            margin: "0 auto",
            background: "var(--wl-surface)",
            border: "1px solid var(--wl-border)",
            borderRadius: 6,
            padding: "5px 12px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--wl-muted)",
          }}
        >
          app.wavelength.in/thumbnail-studio
        </div>
      </div>

      {/* App UI */}
      <div
        style={{
          display: "flex",
          height: 380,
          overflow: "hidden",
        }}
        className="flex-col md:flex-row"
      >
        {/* Left sidebar */}
        <div
          style={{
            width: 224,
            flexShrink: 0,
            borderRight: "1px solid var(--wl-border)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
          className="hidden md:flex"
        >
          {/* Upload zone */}
          <div
            style={{
              border: "1px dashed var(--wl-border)",
              borderRadius: 8,
              padding: "20px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "1px solid var(--wl-border)",
                borderRadius: 6,
                margin: "0 auto 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--wl-muted)",
                fontSize: 14,
              }}
            >
              ↑
            </div>
            <div style={{ fontSize: 11, color: "var(--wl-muted)", lineHeight: 1.4 }}>
              Drop thumbnail here
            </div>
            <div style={{ fontSize: 10, color: "var(--wl-border)", marginTop: 4 }}>
              PNG · JPG · WebP · max 5 MB
            </div>
          </div>

          {/* Title input */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--wl-muted)",
                marginBottom: 6,
                letterSpacing: "0.06em",
              }}
            >
              VIDEO TITLE
            </div>
            <div
              style={{
                background: "var(--wl-bg)",
                border: "1px solid var(--wl-border)",
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 12,
                color: "var(--wl-muted)",
              }}
            >
              10 Shorts ideas that actually work
            </div>
          </div>

          {/* Style picker */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--wl-muted)",
                marginBottom: 6,
                letterSpacing: "0.06em",
              }}
            >
              STYLE
            </div>
            <div
              style={{
                background: "var(--wl-bg)",
                border: "1px solid var(--wl-border)",
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 12,
                color: "var(--wl-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Bold + Face</span>
              <span style={{ opacity: 0.5 }}>▾</span>
            </div>
          </div>

          {/* Generate button */}
          <button
            style={{
              marginTop: "auto",
              padding: "9px 0",
              background: "var(--wl-accent)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Generate →
          </button>
        </div>

        {/* Main area */}
        <div
          style={{
            flex: 1,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "hidden",
          }}
        >
          {/* Thumbnail preview — simulated as CSS art */}
          <div
            style={{
              flex: 1,
              background: "var(--wl-bg)",
              border: "1px solid var(--wl-border)",
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "stretch",
              minHeight: 0,
            }}
          >
            {/* Text side */}
            <div
              style={{
                flex: 1,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--wl-text)",
                  lineHeight: 1.15,
                }}
              >
                10 Shorts
                <br />
                Ideas
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--wl-muted)",
                  fontWeight: 500,
                }}
              >
                That actually work in 2024
              </div>
              <div
                style={{
                  marginTop: 4,
                  display: "inline-block",
                  padding: "3px 8px",
                  background: "var(--wl-accent)",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  width: "fit-content",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                #shorts
              </div>
            </div>
            {/* Silhouette block */}
            <div
              style={{
                width: 90,
                flexShrink: 0,
                background: "var(--wl-elevated)",
                borderLeft: "1px solid var(--wl-border)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 0,
              }}
            >
              {/* Abstract person silhouette using CSS */}
              <svg
                width="56"
                height="100%"
                viewBox="0 0 56 120"
                fill="none"
                style={{ height: "80%", opacity: 0.25 }}
              >
                <circle cx="28" cy="22" r="14" fill="var(--wl-muted)" />
                <path
                  d="M4 120 C4 80 52 80 52 120"
                  fill="var(--wl-muted)"
                />
              </svg>
            </div>
          </div>

          {/* Score cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {[
              {
                label: "CTR Score",
                value: "8.7",
                unit: "/10",
                color: "var(--wl-accent)",
              },
              {
                label: "Contrast",
                value: "Pass",
                color: "var(--wl-success)",
              },
              {
                label: "Face",
                value: "Detected",
                color: "var(--wl-success)",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "var(--wl-elevated)",
                  border: "1px solid var(--wl-border)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--wl-muted)",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 16,
                    fontWeight: 600,
                    color: item.color,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                  {item.unit && (
                    <span
                      style={{ fontSize: 11, fontWeight: 400, color: "var(--wl-muted)" }}
                    >
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export default function Hero() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 18 },
    visible: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, delay, ease: [0, 0, 0.2, 1] },
    }),
  };

  return (
    <section
      style={{
        padding: "96px 0 80px",
        textAlign: "center",
      }}
    >
      <div className="wl-container">
        {/* Heading */}
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          style={{
            fontSize: "clamp(36px, 5.5vw, 60px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--wl-text)",
            maxWidth: 760,
            margin: "0 auto",
            lineHeight: 1.08,
          }}
        >
          Make thumbnails that get clicked.
          <br />
          Know the score before you post.
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial="hidden"
          animate="visible"
          custom={0.08}
          variants={fadeUp}
          style={{
            marginTop: 24,
            fontSize: 17,
            color: "var(--wl-muted)",
            maxWidth: 520,
            margin: "20px auto 0",
            lineHeight: 1.6,
          }}
        >
          Upload a thumbnail and get a CTR prediction score, contrast check,
          and face visibility rating in under 10 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.14}
          variants={fadeUp}
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >
          <button
            className="wl-btn wl-btn-primary wl-btn-lg"
            onClick={() => navigate("/auth")}
          >
            Start free
          </button>
          <a className="wl-btn wl-btn-ghost wl-btn-lg" href="#how-it-works">
            See how it works
          </a>
        </motion.div>

        {/* Browser mock */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.22}
          variants={fadeUp}
          style={{ marginTop: 56 }}
        >
          <BrowserMock />
        </motion.div>
      </div>
    </section>
  );
}
