# Wavelength Technical Documentation

Welcome to the comprehensive technical documentation for **Wavelength**, the AI-powered YouTube Growth & Content Strategy platform.

---

## Documentation Directory Index

| Document | Description |
|---|---|
| [**PROJECT_CONTEXT.md**](./PROJECT_CONTEXT.md) | High-level project summary, business objectives, domain assumptions, and user workflows. |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | System design, 2-Stage Thumbnail Design Studio, Title & Script engines, AI multi-model cascade, and data flow. |
| [**API.md**](./API.md) | Comprehensive API endpoint reference, request/response contracts, auth middleware, and error formats. |
| [**AI_RULES.md**](./AI_RULES.md) | Strict behavioral, prompt design, multilingual (English, Hindi, Hinglish), and anti-mock policies. |
| [**FEATURES.md**](./FEATURES.md) | In-depth breakdown of features (Thumbnail Design Studio, Title Intelligence, Script Intelligence, Ideas, Package, Chat). |
| [**TECH_STACK.md**](./TECH_STACK.md) | Detailed listing of technologies, libraries, model configurations, and runtime dependencies. |
| [**TESTING.md**](./TESTING.md) | Testing strategy, Vitest unit suites, 12-domain image test runners, and acceptance test criteria. |
| [**CHANGELOG.md**](./CHANGELOG.md) | Historical record of versions, re-architectures, and feature upgrades. |
| [**KNOWN_ISSUES.md**](./KNOWN_ISSUES.md) | Documented edge cases, quota recovery protocols, and browser constraints. |
| [**ENVIRONMENT_VARIABLES.md**](./ENVIRONMENT_VARIABLES.md) | Detailed explanation of all required and optional `.env` configuration keys. |
| [**DATABASE.md**](./DATABASE.md) | SQLite schema, tables (`users`, `kv`), and data persistence policies. |

---

## Core System Highlights

1. **Multi-Model AI Cascade**:
   - `gemini-3.5-flash` $\rightarrow$ `gemini-3.5-flash-lite` $\rightarrow$ `gemini-3.6-flash` $\rightarrow$ `gemini-3.7-flash` with rate-limit recovery and exponential backoff.
2. **Professional YouTube Thumbnail Design Studio**:
   - Analyzes content to determine 1-second viewer promise, selects 1 of 12 psychological objectives, enforces 1 dominant hero subject with 6 dynamic composition layouts, generates 1–4 word punchy hooks, renders clean visuals via FLUX / Imagen 3, and layers scalable typography in negative space.
3. **10-Framework Title Intelligence**:
   - High-CTR titles with psychological scoring across Curiosity Gap, Negative Contrast, Speedrun, Extreme Stakes, Secret Revelation, etc.
4. **Multilingual Script Assistant**:
   - Retention-structured scripts in natural English, Hindi (Devanagari), and creator Hinglish.
5. **No Silent Mock Fallback**:
   - Guaranteed production transparency: surfaces genuine API failure states instead of substituting fake coding template content.
