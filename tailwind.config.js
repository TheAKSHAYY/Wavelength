import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Core palette (Playful Geometric) ----
        background: "#FFFDF5",
        foreground: "#1E293B",
        muted: "#F1F5F9",
        "muted-foreground": "#64748B",
        accent: "#8B5CF6",
        "accent-foreground": "#FFFFFF",
        secondary: "#F472B6",
        tertiary: "#FBBF24",
        quaternary: "#34D399",
        border: "#E2E8F0",
        input: "#FFFFFF",
        card: "#FFFFFF",
        ring: "#8B5CF6",

        // ---- Surface helpers (legacy var mapping) ----
        surface: "#FFFFFF",
        "surface-2": "#F1F5F9",
        "surface-3": "#E2E8F0",
        "text-dim": "#9CA3AF",
      },

      fontFamily: {
        display: ['"Outfit"', "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },

      fontSize: {
        xs: "0.6875rem",
        sm: "0.8125rem",
        base: "0.875rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3.125rem",
        "6xl": "4rem",
      },

      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "28px",
        "2xl": "32px",
        full: "9999px",
      },

      borderWidth: {
        DEFAULT: "2px",
        0: "0",
        1: "1px",
        2: "2px",
      },

      boxShadow: {
        pop: "4px 4px 0px 0px #1E293B",
        "pop-hover": "6px 6px 0px 0px #1E293B",
        "pop-active": "2px 2px 0px 0px #1E293B",
        "pop-sm": "3px 3px 0px 0px #1E293B",
        card: "8px 8px 0px 0px #E2E8F0",
        "card-pink": "8px 8px 0px 0px #F472B6",
        "card-sm": "5px 5px 0px 0px #E2E8F0",
      },

      transitionTimingFunction: {
        bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
      },

      animation: {
        wiggle: "wiggle 0.3s ease-in-out",
        "pop-in": "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        bounce: "bounce 1.4s ease-in-out infinite both",
        spin: "spin 1s linear infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },

      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(3deg)" },
          "75%": { transform: "rotate(-3deg)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounce: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
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
          strokeWidth: "2.5px",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
      });
    }),
  ],
};
