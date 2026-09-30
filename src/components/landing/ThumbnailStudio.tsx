import { motion, useReducedMotion } from "framer-motion";
import { thumbnailFacts } from "../../data/landingData";
import { CheckCircle2 } from "lucide-react";

// ── Product mock: thumbnail analysis panel ────────────────────────────────────
function ThumbnailMock() {
  return (
    <div
      className="wl-card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {/* Mock top bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--wl-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--wl-muted)",
            letterSpacing: "0.05em",
          }}
        >
          ANALYSIS REPORT
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--wl-muted)",
          }}
        >
          Jul 28, 2024
        </span>
      </div>

      {/* Thumbnail preview */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            aspectRatio: "16/9",
            background: "var(--wl-elevated)",
            borderRadius: 8,
            border: "1px solid var(--wl-border)",
            overflow: "hidden",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "18px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--wl-text)",
                lineHeight: 1.15,
              }}
            >
              Why Your Shorts
              <br />
              Stop at 15 Seconds
            </div>
            <div style={{ fontSize: 11, color: "var(--wl-muted)" }}>
              (And exactly how to fix it)
            </div>
          </div>
          <div
            style={{
              width: 80,
              background: "var(--wl-border)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <svg
              width="50"
              viewBox="0 0 50 110"
              fill="none"
              style={{ opacity: 0.3 }}
            >
              <circle cx="25" cy="20" r="13" fill="var(--wl-text)" />
              <path d="M3 110 C3 72 47 72 47 110" fill="var(--wl-text)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Score row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          borderTop: "1px solid var(--wl-border)",
        }}
      >
        {[
          { label: "CTR Score", value: "8.7", unit: "/10", color: "var(--wl-accent)", hi: true },
          { label: "Contrast", value: "AA Pass", color: "var(--wl-success)" },
          { label: "Face", value: "Detected", color: "var(--wl-success)" },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "16px",
              borderRight: i < 2 ? "1px solid var(--wl-border)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--wl-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: s.hi ? 22 : 15,
                fontWeight: 600,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
              {s.unit && (
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--wl-muted)" }}>
                  {s.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed feedback */}
      <div
        style={{
          borderTop: "1px solid var(--wl-border)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {[
          { text: "Text contrast ratio 5.3:1 — passes AA", ok: true },
          { text: "Face centred at 82% horizontal — strong", ok: true },
          { text: "Title text covers 28% of the frame — optimal range", ok: true },
          { text: "Thumbnail has high emotional valence score (0.81)", ok: true },
        ].map((item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 12,
              color: "var(--wl-muted)",
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2
              size={13}
              style={{ color: "var(--wl-success)", flexShrink: 0, marginTop: 1 }}
            />
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ThumbnailStudio() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="thumbnail-studio"
      className="wl-section"
      style={{ borderTop: "1px solid var(--wl-border)" }}
    >
      <div className="wl-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--wl-accent)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Thumbnail Studio
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 3.2vw, 38px)",
                fontWeight: 700,
                color: "var(--wl-text)",
                lineHeight: 1.12,
                marginBottom: 24,
              }}
            >
              A score, not
              <br />a feeling.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--wl-muted)",
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 420,
              }}
            >
              Stop guessing which thumbnail will perform. Wavelength runs three
              objective checks and returns a number you can act on.
            </p>

            {/* Bullet facts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {thumbnailFacts.map((fact) => (
                <div key={fact.label}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--wl-text)",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--wl-accent)",
                        flexShrink: 0,
                      }}
                    />
                    {fact.label}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--wl-muted)",
                      lineHeight: 1.6,
                      paddingLeft: 12,
                    }}
                  >
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: product mock */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <ThumbnailMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
