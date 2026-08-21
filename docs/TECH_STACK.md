# Wavelength Tech Stack

## Frontend
- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: `react-router-dom` (lazy-loaded pages with Suspense)
- **Icons**: `lucide-react`
- **Charts**: Recharts
- **Styling**: Vanilla CSS (Global Theme Tokens & Custom Properties) + Tailwind utility layer

---

## Backend
- **Runtime**: Node.js v20+ / v24 (ES Modules)
- **Server Framework**: Express 4.21 + TypeScript (`tsx` for dev watch mode)
- **Database**: SQLite via `better-sqlite3` and `node:sqlite`
- **Authentication**: `node:crypto` scrypt password hashing + `jsonwebtoken` in httpOnly cookies
- **Security & Middleware**: `cors`, `cookie-parser`, `express-rate-limit`

---

## AI & Image Generation Providers
- **Primary AI Provider**: Google Gemini API (`gemini-3.5-flash` default)
- **Fallback Models**: `gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.7-flash`
- **Alternative LLM Providers**: Groq (`llama-3.3-70b-versatile`), OpenRouter, OpenAI (`gpt-4o-mini`, `gpt-4o`)
- **Image Generation Engines**:
  - Pollinations FLUX Engine (`https://image.pollinations.ai/prompt/...`, 1280x720 16:9 HD JPEG)
  - Google Imagen 3 (`imagen-3.0-generate-002`)
- **Research API**: YouTube Data API v3 (for live benchmark statistics)

---

## Testing & Quality Assurance
- **Unit & Integration Testing**: Vitest 3.2
- **Linting & Formatting**: ESLint 9 + Prettier
- **Domain Verification Test Suites**:
  - `server/scripts/test-thumbnail-designer.ts` (11-domain thumbnail design validation)
  - `server/scripts/test-image-pipeline.ts` (12-domain image intelligence test matrix)
  - `server/scripts/verify-topics.ts` (Multilingual cross-domain script/title verification)
