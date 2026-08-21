# Wavelength — AI YouTube Growth & Content Strategy Dashboard

An AI-powered creator platform for YouTube creators and strategists: deep trend discovery, competitor intelligence, keyword research, psychological title generation across 10 frameworks, multilingual script drafting (English, Hindi, Hinglish), a professional **YouTube Thumbnail Design Studio**, and a complete one-click content package synthesizer.

Powered by a resilient **Google Gemini Multi-Model Cascade** (`gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.6-flash` → `gemini-3.7-flash`), with support for Groq, OpenRouter, OpenAI, and live YouTube Data API benchmarks.

---

## What Wavelength Includes

- **Professional YouTube Thumbnail Design Studio**:
  - Semantic content understanding & 1-second viewer promise analysis.
  - 12 psychological thumbnail objectives (Curiosity, Warning, Transformation, Discovery, etc.).
  - 6 dynamic composition layouts (`LEFT_TEXT_RIGHT_SUBJECT`, `RIGHT_TEXT_LEFT_SUBJECT`, `SPLIT_COMPARISON`, etc.).
  - High-CTR text strategy (1–4 punchy words, never duplicating the video title).
  - Separate dynamic text overlay scaling & positioning engine on a 16:9 canvas.
  - Zero-embedded-text image generation via Pollinations FLUX (1280x720 16:9 HD) and Google Imagen 3.
  - Real-time automated Thumbnail QA validation (Focal point clarity, story immediacy, text brevity, mobile legibility, and non-inventive accuracy).
- **10-Framework Title Intelligence**:
  - Generates psychological, high-CTR titles across Curiosity Gap, Negative Contrast, Direct Benefit, Speedrun, Extreme Stakes, Identity Callout, Secret Revelation, etc., complete with CTR scores and virality triggers.
- **Multilingual Script Intelligence**:
  - Generates retention-optimized YouTube scripts with 0–15s hooks, pattern interrupts, retention beats, and engagement CTAs in natural English, Hindi (Devanagari), and creator Hinglish.
- **Multi-Model AI Resilience**:
  - Built-in multi-model fallback cascade with exponential backoff and rate-limit recovery.
  - **Zero Silent Mock Fallbacks**: Real error states are surfaced if the AI pipeline fails rather than returning fake generic coding mock data.
- **AI Channel Strategist Chat**:
  - Multi-turn creator consultant for video brainstorming, packaging advice, and channel roadmapping.
- **Full Creator Dashboard**:
  - React 18 + Vite 6 + TypeScript frontend with lazy-loaded routes and responsive navigation.
  - Express + TypeScript backend proxying AI requests securely.
  - Server-side SQLite persistence (`better-sqlite3` + `node:sqlite`) for per-user settings, ideas, and content state.
  - Authentication with scrypt-hashed passwords and secure httpOnly JWT cookies.

---

## Setup & Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and configure your API keys:

```env
# Primary AI Provider (Google Gemini Recommended)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.5-flash

# Optional Providers
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
YOUTUBE_API_KEY=AIzaSy...

# Security
JWT_SECRET=<long-random-string>
PORT=4180
```

### 3. Seed Development Account (Optional)

```bash
npm run seed:dev
```
Creates dev login credentials: `admin@wavelength.local` / `password123`.

### 4. Run Development Servers

```bash
npm run dev
```
Starts backend server on port `4180` and Vite dev client on `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs backend + frontend concurrently in development mode |
| `npm run dev:server` | Runs Express backend with live TypeScript reload (`tsx watch`) |
| `npm run dev:client` | Runs Vite frontend client |
| `npm run seed:dev` | Seeds a test account (`admin@wavelength.local` / `password123`) |
| `npm test` | Runs complete Vitest test suite across all intelligence engines |
| `npm run build` | Compiles TypeScript server and builds Vite client bundle for production |
| `npm run server` | Starts compiled production server from `server/dist` |
| `npm run typecheck` | Validates TypeScript types across client and server |
| `npm run lint` | Runs ESLint |

---

## Testing & Verification Scripts

- `npx tsx server/scripts/test-thumbnail-designer.ts`: Tests the 2-Stage Thumbnail Design Studio across 10 cross-domain topics + Google HQ acceptance test.
- `npx tsx server/scripts/test-image-pipeline.ts`: Tests the 12-domain image intelligence pipeline with live image rendering.
- `npx tsx server/scripts/verify-topics.ts`: Validates end-to-end multilingual title and script generation across English, Hindi, and Hinglish.

---

## License

MIT
