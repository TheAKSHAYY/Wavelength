import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { faqItems } from "../../data/landingData";

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { id: string; question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="wl-accordion-item">
      <button
        className="wl-accordion-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-trigger-${item.id}`}
      >
        <span>{item.question}</span>
        <span
          style={{
            flexShrink: 0,
            color: isOpen ? "var(--wl-accent)" : "var(--wl-muted)",
            transition: "color 150ms ease",
          }}
        >
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.id}`}
            role="region"
            aria-labelledby={`faq-trigger-${item.id}`}
            key="content"
            initial={shouldReduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduce ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="wl-accordion-content">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      className="wl-section"
      style={{ borderTop: "1px solid var(--wl-border)" }}
    >
      <div className="wl-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 80,
            alignItems: "start",
          }}
          className="grid-cols-1 md:grid-cols-[1fr_2fr]"
        >
          {/* Left */}
          <div>
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
              FAQ
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 2.5vw, 32px)",
                fontWeight: 700,
                color: "var(--wl-text)",
                marginBottom: 16,
                lineHeight: 1.15,
              }}
            >
              Common questions.
            </h2>
            <p style={{ fontSize: 14, color: "var(--wl-muted)", lineHeight: 1.6 }}>
              If your question is not here, write to{" "}
              <a
                href="mailto:support@wavelength.in"
                style={{
                  color: "var(--wl-accent)",
                  textDecoration: "none",
                }}
              >
                support@wavelength.in
              </a>
            </p>
          </div>

          {/* Right: accordion */}
          <div
            style={{ borderTop: "1px solid var(--wl-border)" }}
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
