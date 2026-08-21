# Wavelength Changelog

## [2.1.0] - 2026-08-21
### Added
- **YouTube Thumbnail Design Studio**: Complete re-architecture moving from prompt synthesis to a full YouTube Creative Director pipeline:
  - 12 Thumbnail Objectives (Curiosity, Warning, Transformation, Discovery, etc.) with 1-second viewer promises.
  - 6 Dynamic Composition Layouts (`LEFT_TEXT_RIGHT_SUBJECT`, `RIGHT_TEXT_LEFT_SUBJECT`, `SPLIT_COMPARISON`, etc.).
  - 1–4 word punchy hook text strategy with negative space zoning.
  - Automated Thumbnail QA Checklist (Focal point clarity, 1-sec story immediacy, text brevity, mobile readability, and non-inventive accuracy).
  - Dynamic frontend typography canvas with multi-line word stacking, high-contrast strokes, and backdrop pills.
- **Google Gemini Multi-Model Cascade**: Automatic fallback cascade across `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.6-flash`, and `gemini-3.7-flash` with rate-limit recovery.
- **Multilingual Script Assistant**: Added structured YouTube script generation supporting English, Hindi (Devanagari), and creator Hinglish.
- **10-Framework Title Intelligence**: Dynamic JSON title engine across 10 psychological frameworks with CTR scores and virality triggers.
- **Pollinations FLUX & Google Imagen 3 Engine**: Live 1280x720 16:9 HD thumbnail rendering without embedded text distortion.
- **Multi-Domain Automated Test Runners**: Added `test-thumbnail-designer.ts`, `test-image-pipeline.ts`, and `verify-topics.ts`.

### Changed
- Removed all hardcoded static archetypes and 700-line keyword ladder fallbacks.
- Removed universal coder/developer/laptop biases from non-tech thumbnail presets and prompts.
- Replaced fake `"98% Topic Grounded"` confidence badge with authentic structural metadata and QA diagnostics.
- Refactored `/api/chat` to use the unified multi-model cascade with clean multi-turn history.

### Fixed
- Fixed silent mock-data fallback that was hiding API failure states.
- Fixed Gemini API 400 Bad Request error caused by initial assistant role ordering in chat conversations.
- Fixed positional parameter mapping in `generateDynamicScript`.
