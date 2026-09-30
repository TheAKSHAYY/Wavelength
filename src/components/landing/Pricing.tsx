import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { pricingTiers } from "../../data/landingData";

export default function Pricing() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="pricing"
      className="wl-section"
      style={{ borderTop: "1px solid var(--wl-border)" }}
    >
      <div className="wl-container">
        {/* Header */}
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
          Pricing
        </p>
        <h2
          style={{
            fontSize: "clamp(24px, 2.8vw, 34px)",
            fontWeight: 700,
            color: "var(--wl-text)",
            marginBottom: 8,
          }}
        >
          Pay only for what you use.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--wl-muted)",
            marginBottom: 56,
          }}
        >
          All plans include Thumbnail Studio and Shorts Studio. No hidden fees.
        </p>

        {/* Tier cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            alignItems: "stretch",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.07, ease: "easeOut" }}
              viewport={{ once: true, margin: "-60px" }}
              style={{
                background: "var(--wl-surface)",
                border: tier.popular
                  ? "1px solid var(--wl-accent)"
                  : "1px solid var(--wl-border)",
                borderRadius: 12,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 0,
                position: "relative",
              }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--wl-accent)",
                    color: "#fff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    padding: "4px 12px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Plan name */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: tier.popular ? "var(--wl-accent)" : "var(--wl-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                {tier.name.toUpperCase()}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 38,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--wl-text)",
                  }}
                >
                  {tier.price}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--wl-muted)",
                  marginBottom: 28,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {tier.priceNote}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "var(--wl-border)",
                  marginBottom: 24,
                }}
              />

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  flex: 1,
                }}
              >
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      fontSize: 13,
                      color: "var(--wl-muted)",
                      lineHeight: 1.45,
                    }}
                  >
                    <Check
                      size={13}
                      style={{
                        color: tier.popular
                          ? "var(--wl-accent)"
                          : "var(--wl-success)",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate("/auth")}
                style={{
                  marginTop: 28,
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                  background: tier.popular ? "var(--wl-accent)" : "transparent",
                  border: tier.popular
                    ? "1px solid var(--wl-accent)"
                    : "1px solid var(--wl-border)",
                  color: tier.popular ? "#fff" : "var(--wl-muted)",
                }}
                onMouseEnter={(e) => {
                  if (tier.popular) {
                    e.currentTarget.style.background = "var(--wl-accent-hover)";
                  } else {
                    e.currentTarget.style.color = "var(--wl-text)";
                    e.currentTarget.style.borderColor = "var(--wl-muted)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tier.popular) {
                    e.currentTarget.style.background = "var(--wl-accent)";
                  } else {
                    e.currentTarget.style.color = "var(--wl-muted)";
                    e.currentTarget.style.borderColor = "var(--wl-border)";
                  }
                }}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
