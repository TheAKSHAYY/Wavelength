import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function FinalCTA() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <section
      style={{
        borderTop: "1px solid var(--wl-border)",
        background: "var(--wl-surface)",
        padding: "96px 0",
        textAlign: "center",
      }}
    >
      <div className="wl-container">
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 700,
              color: "var(--wl-text)",
              marginBottom: 24,
              lineHeight: 1.1,
              maxWidth: 600,
              margin: "0 auto 24px",
            }}
          >
            Start scoring thumbnails today.
            <br />
            First five are free.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--wl-muted)",
              marginBottom: 40,
              maxWidth: 440,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            No credit card. No account setup for the first score. Just drop a
            thumbnail and see the number.
          </p>
          <button
            className="wl-btn wl-btn-primary wl-btn-lg"
            onClick={() => navigate("/auth")}
            style={{ margin: "0 auto" }}
          >
            Start free — no card needed
          </button>
        </motion.div>
      </div>
    </section>
  );
}
