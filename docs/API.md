

# Wavelength API Reference

All backend API routes are prefixed with `/api`. Protected routes require either a valid `wl_token` session cookie (via user login) or a matching `x-api-key` header (configured via `API_TOKEN`).

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account and sets a session cookie.
- **Body**: `{ email: string, password: string, name?: string }`
- **Response**: `{ user: PublicUser }`

### `POST /api/auth/login`
Authenticates an existing user and sets the `wl_token` httpOnly cookie.
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: PublicUser }`

### `GET /api/auth/me`
Returns the currently authenticated user session.
- **Response**: `{ user: PublicUser }`

### `POST /api/auth/logout`
Clears the `wl_token` cookie.

---

## 2. Creative Intelligence & Generation (`/api/generate`)

### `POST /api/generate/thumbnail-intelligence`
Runs the complete **Two-Stage YouTube Thumbnail Strategy Engine**.
- **Body**:
  ```json
  {
    "title": "What They Actually Hide Inside Google Headquarters...",
    "topic": "Google Tech Culture",
    "script": "Optional script excerpt",
    "stylePreset": "High-CTR YouTube Viral"
  }
  ```
- **Response**:
  ```json
  {
    "objective": {
      "type": "Curiosity",
      "oneSecondPromise": "What secret area of the Google campus are they not showing on tours?",
      "emotionalTrigger": "Intense curiosity, corporate mystery, and insider revelation"
    },
    "visualStory": {
      "narrative": "A creator wearing a visitor badge peeking with intense intrigue through a frosted-glass security door at Google HQ",
      "primaryFocalSubject": "An everyday insider protagonist peeking through a restricted glass door with a shock reaction",
      "secondaryElements": ["Glowing digital security turnstile", "Blurred modern hallway with employee pods"],
      "backgroundEnvironment": "Ultra-modern corporate hallway inside Google headquarters",
      "subjectPosition": "left"
    },
    "layout": "RIGHT_TEXT_LEFT_SUBJECT",
    "textStrategy": {
      "overlayText": "SECRET ROOM",
      "wordCount": 2,
      "layoutZone": "right",
      "textColor": "#FFE600",
      "pillColor": "rgba(0, 0, 0, 0.78)"
    },
    "enginePrompt": "16:9 YouTube thumbnail photography for 'What They Actually Hide Inside Google Headquarters...'...",
    "qa": {
      "focalPointClarity": { "passed": true, "note": "Defined dominant subject" },
      "storyImmediacy": { "passed": true, "note": "1-sec objective clear" },
      "textBrevity": { "passed": true, "wordCount": 2, "note": "Punchy 2-word hook" },
      "mobileReadability": { "passed": true, "note": "Clean negative space in right zone" },
      "accuracyCheck": { "passed": true, "note": "Grounded in realistic visual context" },
      "overallVerdict": "Ready for Production"
    }
  }
  ```

---

### `POST /api/generate/title-intelligence`
Generates psychological high-CTR titles across 10 distinct frameworks.
- **Body**: `{ "topic": "Java DSA Roadmap" }`
- **Response**:
  ```json
  {
    "titles": [
      {
        "framework": "Curiosity Gap",
        "title": "The Secret Pattern Behind Every DSA Problem (Faang Doesn't Share)",
        "score": 94,
        "psychologicalTrigger": "Curiosity & Insider Advantage",
        "virality": "High",
        "thumbnailVisual": "Illuminated binary tree data structure with glowing nodes"
      }
    ]
  }
  ```

---

### `POST /api/generate/script`
Generates structured YouTube scripts with 0–15s retention hooks, section breakdowns, and CTAs in English, Hindi (Devanagari), or Hinglish.
- **Body**:
  ```json
  {
    "topic": "7 Indian Street Foods You Need to Try",
    "language": "Hinglish",
    "duration": "8-12 minutes",
    "mode": "full"
  }
  ```
- **Response**:
  ```json
  {
    "title": "7 Indian Street Foods You Must Try in 2026",
    "language": "Hinglish",
    "hook": "Log kehte hain street food unhealthy hota hai, par aaj main aapko dikhaunga...",
    "sections": [
      {
        "title": "Section 1: The Sizzling Tawa Pav Bhaji",
        "content": "Full spoken dialogue...",
        "visualCues": "Extreme close-up shot of melting butter on tawa",
        "pacing": "High energy",
        "durationEstimate": "2 minutes"
      }
    ],
    "outro": "Call to action dialogue..."
  }
  ```

---

## 3. Image Generation (`/api/gemini/generate-image`)

### `POST /api/gemini/generate-image`
Generates high-resolution images via Google Imagen 3 or Pollinations FLUX engine.
- **Body**: `{ "prompt": "16:9 YouTube thumbnail depicting...", "style": "Cinematic" }`
- **Response**: `{ "image": "data:image/jpeg;base64,...", "url": "https://image.pollinations.ai/..." }`

---

## 4. AI Channel Strategist (`/api/chat`)

### `POST /api/chat`
Conversational creator mentor for video packaging, channel audits, and title brainstorming.
- **Body**:
  ```json
  {
    "message": "Give me 3 viral ideas for an Indian Street Food channel in Hinglish",
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "ai", "content": "Welcome to Wavelength!" }
    ]
  }
  ```
- **Response**: `{ "reply": "Markdown formatted strategy recommendations..." }`

---

## 5. State Persistence (`/api/state`)

### `GET /api/state`
Loads all saved dashboard data for the authenticated user.

### `PUT /api/state`
Saves dashboard data for the authenticated user.
- **Body**: `{ "key": "ideas", "value": [...] }`
