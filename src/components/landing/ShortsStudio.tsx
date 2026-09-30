import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { shortsFacts } from "../../data/landingData";

// ── Hook Generator Mock ───────────────────────────────────────────────────────
function HookList() {
  const hooks = [
    {
      n: "01",
      text: "Most creators skip this one step before posting Shorts — and it's costing them 60% of their watch time.",
      selected: false,
    },
    {
      n: "02",
      text: "I posted 100 Shorts in 30 days using the same format every time. Here's what the data actually showed.",
      selected: true,
    },
    {
      n: "03",
      text: "The reason your Shorts stop at 15 seconds is not your content — it's this specific editing mistake.",
      selected: false,
    },
  ];

  return (
    <div className="wl-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
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
          HOOK VARIANTS — "100 Shorts in 30 days"
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--wl-accent)",
          }}
        >
          Hinglish ▾
        </span>
      </div>

      {/* Hook list */}
      {hooks.map((hook, i) => (
        <div
          key={hook.n}
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 16px",
            borderBottom:
              i < hooks.length - 1 ? "1px solid var(--wl-border)" : "none",
            background: hook.selected ? "var(--wl-elevated)" : "transparent",
            position: "relative",
          }}
        >
          {hook.selected && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: "var(--wl-accent)",
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: hook.selected ? "var(--wl-accent)" : "var(--wl-muted)",
              flexShrink: 0,
              paddingTop: 1,
            }}
          >
            {hook.n}
          </span>
          <p
            style={{
              fontSize: 13,
              color: hook.selected ? "var(--wl-text)" : "var(--wl-muted)",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {hook.text}
          </p>
          {hook.selected && (
            <button
              style={{
                flexShrink: 0,
                alignSelf: "center",
                padding: "4px 10px",
                background: "var(--wl-accent)",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Use ↗
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Storyboard Timeline Mock ──────────────────────────────────────────────────
function Storyboard() {
  const scenes = [
    {
      n: "01",
      label: "Hook",
      time: "0–3s",
      script: "I posted 100 Shorts in 30 days using the same format every time.",
      note: "High energy, straight to point",
    },
    {
      n: "02",
      label: "Main content",
      time: "3–18s",
      script: "Here are the 3 things the data actually showed — retention, shares, and which days performed.",
      note: "Show clips / screen recording",
    },
    {
      n: "03",
      label: "CTA",
      time: "18–22s",
      script: "Follow for part 2 — I'll share the exact template I now use for every upload.",
      note: "Loop back to thumbnail frame",
    },
  ];

  return (
    <div className="wl-card" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--wl-border)",
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
          STORYBOARD
        </span>
      </div>

      <div style={{ padding: 12, overflowX: "auto" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            minWidth: 0,
          }}
        >
          {scenes.map((scene, i) => (
            <Fragment key={scene.n}>
              <div
                style={{
                  flex: "1 1 160px",
                  background: "var(--wl-elevated)",
                  border: "1px solid var(--wl-border)",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 140,
                }}
              >
                {/* Scene header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: "var(--wl-accent)",
                        fontWeight: 600,
                      }}
                    >
                      {scene.n}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--wl-text)" }}>
                      {scene.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      color: "var(--wl-muted)",
                    }}
                  >
                    {scene.time}
                  </span>
                </div>
                {/* Script preview */}
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--wl-muted)",
                    lineHeight: 1.5,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {scene.script}
                </p>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--wl-border)",
                    paddingTop: 6,
                    borderTop: "1px solid var(--wl-border)",
                  }}
                >
                  {scene.note}
                </div>
              </div>
              {/* Arrow connector */}
              {i < scenes.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--wl-border)",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ShortsStudio() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="shorts-studio"
      className="wl-section"
      style={{ borderTop: "1px solid var(--wl-border)" }}
    >
      <div className="wl-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Left: product mock (mirrored) */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
            className="order-2 md:order-1"
          >
            <HookList />
            <Storyboard />
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
            className="order-1 md:order-2"
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
              Shorts Studio
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
              From topic to
              <br />
              storyboard in one step.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--wl-muted)",
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              Paste a topic, pick a language, and get three hook variants plus a
              three-scene storyboard — ready to shoot, not a rough outline.
            </p>

            {/* Bullet facts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {shortsFacts.map((fact) => (
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
        </div>
      </div>
    </section>
  );
}
