import { motion, useReducedMotion } from "framer-motion";
import { howItWorksSteps } from "../../data/landingData";

export default function HowItWorks() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="how-it-works"
      style={{
        padding: "96px 0",
        borderTop: "1px solid var(--wl-border)",
        background: "var(--wl-surface)",
      }}
    >
      <div className="wl-container">
        {/* Section label */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--wl-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontSize: "clamp(24px, 2.8vw, 34px)",
            fontWeight: 700,
            color: "var(--wl-text)",
            marginBottom: 56,
          }}
        >
          Three steps, no setup.
        </h2>

        {/* Steps row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 40,
            position: "relative",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 22,
              left: "calc(33.3% - 20px)",
              right: "calc(33.3% - 20px)",
              height: 1,
              background: "var(--wl-border)",
              zIndex: 0,
            }}
          />

          {howItWorksSteps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.07, ease: "easeOut" }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ position: "relative", zIndex: 1 }}
            >
              {/* Number */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    border: "1px solid var(--wl-border)",
                    borderRadius: 8,
                    background: "var(--wl-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="wl-mono"
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--wl-accent)",
                    }}
                  >
                    {step.number}
                  </span>
                </div>
              </div>

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--wl-text)",
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--wl-muted)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
