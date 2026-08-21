# System Architecture

## Overview

Wavelength is structured as a decoupled client-server architecture designed for high-velocity YouTube creator workflows, robust AI orchestration, and deterministic visual and script intelligence.

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite 6 Client              │
│  - Thumbnail Design Studio (Dynamic Text Scaling Canvas)│
│  - 10-Framework Title Intelligence Explorer             │
│  - Multilingual Script Assistant (Eng / Hin / Hinglish) │
│  - AI Strategist Chat & Package Synthesizer             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (Proxy / Session Cookie)
┌───────────────────────────▼────────────────────────────┐
│                  Express + TypeScript Server           │
│  - Auth & Session Middleware (scrypt + JWT httpOnly)   │
│  - SQLite Database Persistence (`better-sqlite3`)      │
│  - Rate Limiting & Input Validation                    │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
┌───────▼───────────┐ ┌─────▼───────────┐ ┌─────▼────────────┐
│ AI Provider Engine│ │ Thumbnail Studio│ │ YouTube Research │
│ Multi-Model Flash │ │ 2-Stage Visual  │ │ Data API v3      │
│ Cascade (Gemini)  │ │ Spec + FLUX /   │ │ Benchmarks &     │
│ Groq / OpenAI     │ │ Imagen 3 Render │ │ Competitors      │
└───────────────────┘ └─────────────────┘ └──────────────────┘
```

---

## Key Architectural Components

### 1. Multi-Model AI Cascade (`server/services/aiProvider.ts`)
- **Primary Engine**: Google Gemini API default (`gemini-3.5-flash`).
- **Resilience Cascade**: If a rate limit (HTTP 429) or temporary timeout occurs, requests automatically cascade across:
  1. `gemini-3.5-flash`
  2. `gemini-3.5-flash-lite`
  3. `gemini-3.6-flash`
  4. `gemini-3.7-flash`
  5. Groq Cloud (`llama-3.3-70b-versatile`)
  6. OpenRouter / OpenAI
- **Strict Anti-Mock Policy**: If all configured AI providers fail, an explicit `Error` is thrown, returning an HTTP 500/502 error to the client with an actionable description. **Silent mock fallbacks are completely eliminated.**

---

### 2. Professional YouTube Thumbnail Design Studio (`server/services/thumbnailIntelligence.ts`)

Instead of treating thumbnails as simple prompt generators, Wavelength implements a **Two-Stage Visual Strategy Pipeline**:

```
[STAGE 1: Visual Strategy & Specification Analysis]
Input: Title / Topic / Script Context
  ↓
1. Content Understanding (True intent, non-literal analysis)
2. Thumbnail Objective (1 of 12 Triggers: Curiosity, Warning, Transformation, Mystery, etc.)
3. Visual Story & Hierarchy (1 dominant primary focal subject + 1-2 secondary items + backdrop)
4. Composition Engine (Selects: LEFT_TEXT_RIGHT_SUBJECT, RIGHT_TEXT_LEFT_SUBJECT, SPLIT_COMPARISON, etc.)
5. Text Strategy (1–4 punchy words, negative space zone, contrast colors)
6. Automated QA Assessment (Checks focal point, 1-sec story immediacy, text brevity, mobile readability, non-invention)

[STAGE 2: Prompt Synthesis & Clean Generative Render]
Prompt Builder:
  - Generates 16:9 prompt instructing the model on subject, framing, lighting, and negative space
  - Strictly enforces: ZERO EMBEDDED TEXT OR LETTERS
Generative Engine:
  - Pollinations FLUX Engine (1280x720 16:9 HD JPEG)
  - Google Imagen 3 Predict API (`imagen-3.0-generate-002`)

[STAGE 3: Client-Side Dynamic Typography Overlay]
Canvas Engine (`src/pages/ImageGeneratorPage.tsx`):
  - Dynamic font size calculation (`clamp(24px, 5vw, 56px)` to `clamp(18px, 3.8vw, 42px)`)
  - Multi-line word stacking (auto-splits 3-4 words across 2 balanced lines)
  - Placed into the designated negative space zone with high-contrast text stroke, drop shadow, and backdrop pill
```

---

### 3. 10-Framework Title Intelligence Engine (`server/services/titleIntelligence.ts`)

Synthesizes high-CTR titles across 10 psychological frameworks:
1. **Curiosity Gap**
2. **Negative Contrast / Warning**
3. **Direct Benefit / Transformation**
4. **Speedrun / Shortcut**
5. **Extreme Stakes / Challenge**
6. **Identity Callout**
7. **Secret Revelation / Forbidden**
8. **Story / Journey**
9. **Authority / Data-Backed**
10. **Pattern Interrupt / Absurdity**

Each title is enriched with CTR scores, virality indicators, psychological trigger explanations, and thumbnail visual pairing suggestions.

---

### 4. Multilingual Script Intelligence Engine (`server/services/scriptIntelligence.ts`)

Generates structured YouTube scripts adhering to creator retention architecture:
- **0–15s Hook**: Visual staging, verbal pattern interrupt, high-stakes premise.
- **Section Breakdown**: Pacing notes, visual directions, retention spikes, and community CTAs.
- **Language Support**: English, Hindi (Devanagari script), and creator Hinglish.

---

### 5. Data Persistence & Security

- **Database**: SQLite via `better-sqlite3` and `node:sqlite`.
- **Tables**:
  - `users`: User account identity, email, name, scrypt password hash.
  - `kv`: User-scoped JSON key-value store for dashboard preferences, saved ideas, scripts, packages, and calendar entries.
- **Auth**: Passwords hashed with `node:crypto.scryptSync`. Tokens signed via HMAC-SHA256 JWTs stored in `httpOnly`, `SameSite=Lax` cookies.
