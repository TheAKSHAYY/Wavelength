# Known Issues & Operational Considerations

## 1. Rate Limiting on Free-Tier AI Keys
- **Behavior**: Free-tier Google Gemini API keys may occasionally encounter HTTP 429 rate limit errors under high-frequency batch test execution.
- **Mitigation**: Built-in multi-model cascade automatically retries across `gemini-3.5-flash-lite`, `gemini-3.6-flash`, and `gemini-3.7-flash` with exponential backoff. If all fail, an explicit 500/502 error is returned to the user.

---

## 2. YouTube Data API v3 Search Quota
- **Behavior**: The public Google Cloud YouTube Data API has a default daily quota limit (100 search units/day on free projects).
- **Mitigation**: When YouTube search quota is exhausted, Wavelength gracefully falls back to internal AI topic and competitor benchmark synthesis without blocking user workflows.

---

## 3. High-DPI Canvas Previews
- **Behavior**: On ultra-wide desktop monitors, thumbnail preview renders are dynamically constrained to 16:9 aspect ratio (`aspectRatio: "16 / 9"`) to guarantee pixel-accurate representation of YouTube mobile and desktop video cards.
