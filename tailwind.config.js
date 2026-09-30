import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        hindi: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
      colors: {
        // ---- Core palette (Matches Landing Page) ----
        background: "#0B0B0F",
        foreground: "#F5F5F7",
        muted: "#14141A",
        "muted-foreground": "#9A9AA8",
        accent: "#FF6B4A",
        "accent-hover": "#FF8566",
        "accent-foreground": "#FFFFFF",
        secondary: "#FF8566",
        tertiary: "#22D3EE",
        quaternary: "#34D399",
        border: "#2A2A35",
        input: "#1C1C24",
        card: "#14141A",
        ring: "#FF6B4A",

        // ---- Surface helpers ----
        surface: "#14141A",
        "surface-2": "#1C1C24",
        "surface-3": "#252530",
        "text-dim": "#686878",

        // ---- Token-mapped colors (runtime CSS var resolution) ----
        token: {
          bg:              "var(--bg)",
          surface:         "var(--surface)",
          "surface-2":     "var(--surface-2)",
          "surface-3":     "var(--surface-3)",
          text:            "var(--text-primary)",
          "text-secondary":"var(--text-secondary)",
          "text-muted":    "var(--text-muted)",
          "text-dim":      "var(--text-dim)",
          border:          "var(--border)",
          "border-light":  "var(--border-light)",
          accent:          "var(--accent)",
          "accent-light":  "var(--accent-light)",
          "accent-warm":   "var(--accent-warm)",
          "accent-mint":   "var(--accent-mint)",
          "accent-amber":  "var(--accent-amber)",
          "accent-blue":   "var(--accent-blue)",
          "accent-purple": "var(--accent-purple)",
          "accent-red":    "var(--accent-red)",
          "accent-glow":   "var(--accent-glow)",
        },
      },

      fontSize: {
        xs:   ["12px", { lineHeight: "1.4", letterSpacing: "0.05em" }],
        sm:   ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        md:   ["20px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        lg:   ["25px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        xl:   ["31px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "2xl":["39px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "3xl":["49px", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "4xl":["61px", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        // Token-mapped aliases
        "token-xs":   "var(--text-xs)",
        "token-sm":   "var(--text-sm)",
        "token-base": "var(--text-base)",
        "token-md":   "var(--text-md)",
        "token-lg":   "var(--text-lg)",
        "token-xl":   "var(--text-xl)",
        "token-2xl":  "var(--text-2xl)",
      },

      spacing: {
        1:  "4px",
        2:  "8px",
        3:  "12px",
        4:  "16px",
        5:  "20px",
        6:  "24px",
        8:  "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        30: "120px",
        // Token-mapped spacing aliases
        "token-1":  "var(--space-1)",
        "token-2":  "var(--space-2)",
        "token-3":  "var(--space-3)",
        "token-4":  "var(--space-4)",
        "token-6":  "var(--space-6)",
        "token-8":  "var(--space-8)",
        "token-12": "var(--space-12)",
        "token-16": "var(--space-16)",
      },

      borderRadius: {
        sm:   "8px",
        md:   "16px",
        lg:   "24px",
        xl:   "28px",
        "2xl":"32px",
        full: "9999px",
        // Token-mapped aliases
        "token-sm":   "var(--radius-sm)",
        "token-md":   "var(--radius-md)",
        "token-lg":   "var(--radius-lg)",
        "token-xl":   "var(--radius-xl)",
        "token-full": "var(--radius-full)",
      },

      borderWidth: {
        DEFAULT: "2px",
        0: "0",
        1: "1px",
        2: "2px",
      },

      boxShadow: {
        pop:          "4px 4px 0px 0px #1E293B",
        "pop-hover":  "6px 6px 0px 0px #1E293B",
        "pop-active": "2px 2px 0px 0px #1E293B",
        "pop-sm":     "3px 3px 0px 0px #1E293B",
        card:         "8px 8px 0px 0px #E2E8F0",
        "card-pink":  "8px 8px 0px 0px #F472B6",
        "card-sm":    "5px 5px 0px 0px #E2E8F0",
        // Token-mapped aliases
        "token-sm":   "var(--shadow-sm)",
        "token-md":   "var(--shadow-md)",
        "token-lg":   "var(--shadow-lg)",
        "token-xl":   "var(--shadow-xl)",
      },

      transitionTimingFunction: {
        bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        75:  "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
      },

      animation: {
        wiggle:   "wiggle 0.3s ease-in-out",
        "pop-in": "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        bounce:   "bounce 1.4s ease-in-out infinite both",
        spin:     "spin 1s linear infinite",
        pulse:    "pulse 2s ease-in-out infinite",
        shimmer:  "shimmer 1.6s ease-in-out infinite",
      },

      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%":      { transform: "rotate(3deg)" },
          "75%":      { transform: "rotate(-3deg)" },
        },
        "pop-in": {
          "0%":   { opacity: "0", transform: "scale(0)" },
          "50%":  { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounce: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.4" },
          "40%":           { transform: "scale(1)",  opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
      },

      borderStyle: {
        dashed: "dashed",
        dotted: "dotted",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".icon": {
          strokeWidth:    "2.5px",
          strokeLinecap:  "round",
          strokeLinejoin: "round",
        },
      });
    }),
  ],
};
