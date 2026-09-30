# Wavelength — Creator Studio

A creator tool for Indian YouTube creators with two products:

- **Thumbnail Studio** — upload a thumbnail and get a CTR prediction score (0–10), WCAG AA contrast check, and face visibility detection.
- **Shorts Studio** — paste a topic and get 3 hook variants plus a 3-scene storyboard, in English, Hindi, or Hinglish.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom CSS variables (no CSS-in-JS) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Animations | Framer Motion (scroll-in only, 150–250ms, respects prefers-reduced-motion) |
| Data | Typed mock data (`src/data/landingData.ts`) — no backend |

---

## Project Structure

```
src/
├── components/
│   ├── landing/          # Landing page sections
│   │   ├── Navbar.tsx        Sticky nav with logo, links, CTAs
│   │   ├── Hero.tsx          Heading + browser window UI mock
│   │   ├── ThumbnailStudio.tsx  Text-left / visual-right section
│   │   ├── ShortsStudio.tsx   Mirrored layout with hook + storyboard mocks
│   │   ├── HowItWorks.tsx    3-step horizontal row
│   │   ├── Pricing.tsx       3-tier cards (Free / ₹349 / ₹899)
│   │   ├── FAQ.tsx           Animated accordion (5 questions)
│   │   ├── FinalCTA.tsx      Centered CTA section
│   │   └── Footer.tsx        Simple links footer
│   └── ui/               Shared UI primitives (app-wide)
├── data/
│   └── landingData.ts    Typed mock data — FAQItem, PricingTier, HowItWorksStep, BulletFact
├── pages/
│   └── LandingPage.tsx   Assembles all landing sections
├── styles/
│   ├── landing.css       Design tokens + base styles for landing page
│   ├── tokens.css        App design tokens
│   └── premium.css       App shell styles
└── App.tsx               Routing: "/" → LandingPage, "/auth" → AuthPage
```

---

## Design System — Landing Page

All tokens live in `src/styles/landing.css` under the `.wl-landing` scope:

| Token | Value | Use |
|---|---|---|
| `--wl-bg` | `#0B0B0F` | Page background |
| `--wl-surface` | `#14141A` | Card background |
| `--wl-elevated` | `#1C1C24` | Elevated surfaces |
| `--wl-border` | `#2A2A35` | Borders |
| `--wl-accent` | `#FF6B4A` | Coral — primary CTA, active states, key numbers ONLY |
| `--wl-accent-hover` | `#FF8566` | Coral hover |
| `--wl-text` | `#F5F5F7` | Primary text |
| `--wl-muted` | `#9A9AA8` | Secondary text |
| `--wl-success` | `#34D399` | Pass / detected states |
| `--wl-warning` | `#FBBF24` | Warnings |
| `--wl-error` | `#F87171` | Error states |

**Fonts:**
- `Space Grotesk` 500–700 — all headings
- `Inter` — body copy
- `JetBrains Mono` — numbers, scores, labels, code

**Design constraints (enforced):**
- No gradients, no glow, no glassmorphism, no blurred blobs
- Coral used ONLY on primary button, active left-border, and key metric numbers
- Text is left-aligned except hero heading and final CTA
- Layouts alternate: text-left / text-right / full-width
- Section gap: 120px desktop, 72px mobile
- Max content width: 1152px
- Radius: 12px cards, 8px buttons/inputs
- Animation: 150–250ms ease, scroll-in only via Framer Motion

---

## How to Run

```bash
# Install dependencies
npm install

# Start dev server (Vite)
npm run dev

# The app runs on http://localhost:5173
# Unauthenticated users see the landing page at /
# Auth page is at /auth
```

---

## Routing

| Path | Authenticated | Unauthenticated |
|---|---|---|
| `/` | Dashboard | Landing Page |
| `/auth` | Redirect to `/` | Auth / Sign-up |
| `/shorts`, `/packaging`, etc. | App pages | Redirect to `/` |

---

## Mock Data

All landing page content is in `src/data/landingData.ts`:

- `faqItems` — 5 FAQ entries
- `pricingTiers` — Free / Creator (₹349) / Pro (₹899)
- `howItWorksSteps` — 3 steps
- `thumbnailFacts` — 3 bullet facts for the Thumbnail Studio section
- `shortsFacts` — 3 bullet facts for the Shorts Studio section

Replace these with API calls when the backend is ready.
