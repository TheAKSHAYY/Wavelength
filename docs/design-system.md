# Wavelength — Design System & Engineering Specification

> **Version**: 3.1  
> **Status**: Active Standard  
> **Core Palette**: Dark Studio (`#0B0B0F`) with Coral Accent (`#FF6B4A`)  
> **Target Audience**: Professional YouTube Creators & Production Studios

---

## 1. Hard Rules (Non-Negotiable)

To maintain a clean, refined, high-end cinema aesthetic, the following rules apply across all pages, components, and states:

1. **No Gradients** on card backgrounds, button surfaces, or hero wrappers. Surfaces are pure solid tokens (`#0B0B0F`, `#14141A`, `#1C1C24`).
2. **No Glows / Halos**: Remove all neon drop shadows, outer box-shadow halos, and pulsing blur effects. Shadows are purely structural depth (`0 8px 24px -6px rgba(0, 0, 0, 0.6)`).
3. **No Glassmorphism**: No `backdrop-filter: blur()`, semi-transparent frosted panels, or border opacity gimmicks. Surfaces are solid, legible, and discrete.
4. **No Emojis in UI**: Use strictly Lucide SVG icons (`strokeWidth={2}` or `1.5`) and typographic labels. Zero unicode emojis.

---

## 2. Typography Architecture

### 2.1 Font Families
Maximum 2 font families + 1 monospace family loaded via variable Google Fonts with `font-display: swap`:

| Token | Font Family | Role | Weights Used |
|---|---|---|---|
| `--font-display` | `Space Grotesk`, sans-serif | Headings & Hero Titles | 600, 700 |
| `--font-body` | `Inter`, sans-serif | Body Copy, UI Elements, Actions | 400, 600 |
| `--font-mono` | `JetBrains Mono`, monospace | Metrics, Scores, Timestamps, Credits, Prompts | 500, 700 |
| `--font-hindi` | `Noto Sans Devanagari`, sans-serif | Hindi / Hinglish script & localized copy | 400, 600 |

### 2.2 Ratio 1.25 Modular Type Scale
All arbitrary font sizes are strictly mapped to the 1.25 ratio modular scale:

| Token | Pixel Size | Tailwind Class | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `xs` | **12px** | `text-xs` | 1.4 | `0.05em` | Small uppercase labels, status tags, badges |
| `sm` | **14px** | `text-sm` | 1.5 | `normal` | Sub-copy, secondary metadata, table items |
| `base` | **16px** | `text-base` | 1.6 | `normal` | Standard body copy (max-width `65ch`) |
| `md` | **20px** | `text-md` | 1.25 | `-0.02em` | Card titles, H4 sub-headings, modal headers |
| `lg` | **25px** | `text-lg` | 1.2 | `-0.02em` | Section headers, H3 sub-headings |
| `xl` | **31px** | `text-xl` | 1.15 | `-0.02em` | Page titles, H2 headlines |
| `2xl` | **39px** | `text-2xl` | 1.1 | `-0.02em` | Major page banners, H1 titles |
| `3xl` | **49px** | `text-3xl` | 1.1 | `-0.025em` | Marketing sub-hero headings |
| `4xl` | **61px** | `text-4xl` | 1.05 | `-0.03em` | Primary marketing hero display |

### 2.3 Typographic Rules
- **Headings (H1–H4)**: Weight 600–700, line-height 1.1–1.2, letter-spacing `-0.02em`.
- **Body Text**: Weight 400, line-height 1.6, maximum paragraph width `65ch`.
- **Small Uppercase Labels (`.label-caps`)**: 12–13px, weight 600, letter-spacing `0.05em`, uppercase, secondary muted color.
- **Hindi Text (`.text-hindi`)**: Uses `Noto Sans Devanagari` with generous line-height `1.7` for matra clearance.

---

## 3. Visual Hierarchy & The "Squint Test"

Every view must pass the **Squint Test**: squint your eyes at the screen — the single most important action and heading must remain instantly recognizable without visual clutter.

### 3.1 Single Primary Focal Point
- **Exactly ONE primary CTA (`btn-primary`, Coral `#FF6B4A`) per screen view.**
- All secondary actions use `btn-secondary` (`background: var(--surface-2)`, `border: 1px solid var(--border)`).
- Auxiliary or dismissive actions use `btn-ghost`.
- The topbar navigation actions must remain secondary so they do not compete with page-level workflows.

### 3.2 Strict 3-Level Text System
No arbitrary greys. All text must strictly map to:

| Level | Token | Color Value | Purpose |
|---|---|---|---|
| **Primary** | `--text-primary` | `#F5F5F7` | Headings, active values, high-contrast labels |
| **Secondary** | `--text-secondary` | `#9A9AA8` | Descriptions, body prose, inactive tabs |
| **Tertiary** | `--text-tertiary` | `#686878` | Dim metadata, keyboard shortcuts, border labels |

---

## 4. Spacing System (8px Grid)

All padding, margins, gaps, and structural heights adhere strictly to the 8px grid:

| Token | Pixels | Application |
|---|---|---|
| `--space-1` | **4px** | Micro padding, inline badge spacing |
| `--space-2` | **8px** | Standard component gaps, tight icon gaps |
| `--space-3` | **12px** | Input padding, compact list gaps |
| `--space-4` | **16px** | Card internal padding, button padding |
| `--space-5` | **20px** | Section item gaps |
| `--space-6` | **24px** | Standard card padding |
| `--space-8` | **32px** | Interior app section gaps (32px – 48px) |
| `--space-10` | **40px** | Major block separation |
| `--space-12` | **48px** | Page bottom padding, major view transitions |
| `--space-16` | **64px** | App header / hero spacing |
| `--space-20` | **80px** | Landing transition spacing |
| `--space-30` | **120px** | Landing page vertical section gap |

---

## 5. Motion & Animation Standards

Animations must serve a clear cognitive purpose: **orientation**, **feedback**, or **attention guidance**. No decorative looping or distracting wobbles.

### 5.1 Durations & Easings
- **Hover & Focus**: `150ms`  
  - Easing: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
- **UI State Transitions (tabs, accordion, toggles)**: `200ms – 250ms` (standard: `220ms`)  
  - Easing: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
- **Page & View Entrance**: Maximum `400ms` (standard: `380ms`)  
  - Easing: `cubic-bezier(0, 0, 0.2, 1)`
- **Exit Transitions**:  
  - Easing: `cubic-bezier(0.4, 0, 1, 1)` (ease-in)
- **No Bounce / Overshoot**: Spring physics with overshoot are prohibited.

### 5.2 Animated Properties
- Animate **ONLY** `transform` and `opacity`.
- **NEVER** animate `width`, `height`, `top`, `left`, `margin`, or `padding` to prevent browser reflows and jank.

### 5.3 Staggered Lists & Scroll Reveals
- Entrance keyframe: `fade + 12px translateY`.
- Once per element (not looped).
- List items staggered at exactly `60ms` increments:
  ```css
  .fade-up-1 { animation-delay: 60ms; }
  .fade-up-2 { animation-delay: 120ms; }
  .fade-up-3 { animation-delay: 180ms; }
  .fade-up-4 { animation-delay: 240ms; }
  .fade-up-5 { animation-delay: 300ms; }
  .fade-up-6 { animation-delay: 360ms; }
  ```

### 5.4 Reduced Motion Accessibility
Respect user system preferences by flattening transitions:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Implementation Reference

```html
<!-- Example of a Hero Focal Component -->
<div class="studio-hero-card">
  <span class="label-caps">ACTIVE PRODUCTION</span>
  <h2 class="text-lg font-bold text-token-text">"Why Senior Developers Write Less Code"</h2>
  <p class="text-sm text-token-text-secondary max-w-[65ch]">
    Scripting in progress with 4 retention checkpoints and verified 0-3s hook.
  </p>
  <button class="btn btn-primary">
    Continue Working &rarr;
  </button>
</div>
```
