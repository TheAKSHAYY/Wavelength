# Project Context

## Purpose
This document provides complete, operational context for Wavelength—its mission, architecture, AI behavior, domain rules, and implementation details.

---

## Product Summary
Wavelength is an AI-powered creator platform that turns any topic, niche, or channel concept into an actionable, high-velocity YouTube growth strategy. It unifies:
- **YouTube Thumbnail Design Studio**: Professional visual strategy, 12 psychological objectives, 6 dynamic composition layouts, 1–4 word punchy hooks, clean image generation (FLUX / Imagen 3), and dynamic typography overlay in negative space.
- **10-Framework Title Intelligence**: High-CTR title generation across 10 psychological frameworks with CTR scores and virality triggers.
- **Multilingual Script Assistant**: Retention-optimized scripts in English, Hindi (Devanagari), and creator Hinglish.
- **AI Channel Strategist**: Conversational creator consultant for packaging and competitor gap analysis.
- **Market & Trend Discovery**: Niche velocity analysis, competitor gap detection, and 5-video series roadmaps.
- **One-Click Package Synthesizer**: Complete multi-asset package in a single action.

---

## AI Architecture & Model Cascade
- **Primary Model**: Google Gemini API default (`gemini-3.5-flash`).
- **Resilience Cascade**: Automatically retries across `gemini-3.5-flash-lite`, `gemini-3.6-flash`, and `gemini-3.7-flash` (plus Groq and OpenAI support).
- **Strict Anti-Mock Policy**: Silent mock-data fallbacks have been completely eliminated. Real error states are surfaced if the AI pipeline fails.

---

## Domain Rules & Non-Tech Topic Grounding
- The user's input topic is the single source of truth.
- **Zero Developer/Coder Bias**: Non-tech topics (e.g. Indian Street Food, Fitness, Cricket, Travel, Marvel) never receive developer/laptop/workstation visuals or keywords.
- **Zero Embedded Text in Image Models**: AI image prompts enforce clean visuals without distorted text. High-CTR text is layered separately via dynamic frontend typography.
- **Full Multilingual Support**: English, Hindi, and Hinglish are preserved without destructive Unicode normalization.

---

## Data Persistence & Security
- User accounts and dashboard state are stored server-side in SQLite (`better-sqlite3` + `node:sqlite`).
- Passwords are encrypted with `node:crypto.scryptSync`. Sessions are authenticated via httpOnly JWT cookies.
