# Wavelength AI Rules & Policies

## 1. Single Source of Truth: The User's Exact Topic
- **Strict Domain Grounding**: The user's input topic is the sole anchor for all generation.
- **No Universal Coding Fallbacks**: Never inject coding, developer, laptop, IDE, or workstation imagery/text into non-tech topics (e.g. Cooking, Fitness, Travel, Cricket, Marvel).
- Coding visuals and terminology are permitted **only** when the user explicitly requests software, coding, or computer science topics (e.g. Java DSA, React performance, SQL).

---

## 2. Strict Anti-Mock Fallback Policy
- **Never return silent mock/demo data**: If an AI call or provider cascade fails, the system must throw an explicit error and return an HTTP 500/502 status.
- Never substitute hardcoded coding templates, mock SVGs, or pre-scripted generic advice when AI generation fails.

---

## 3. Multilingual Nuance & Unicode Integrity
- Full support for **English**, **Hindi (Devanagari script)**, and **creator Hinglish**.
- **No destructive normalization**: Never strip Devanagari or Unicode characters before semantic analysis.
- Understand local creator vernacular (e.g. *"bhai fitness pe content banana hai"* $\rightarrow$ Gym / Athletic Training domain).

---

## 4. Professional YouTube Thumbnail Philosophy
- **Think Like a YouTube Creative Director**:
  - `Topic` $\rightarrow$ `Content Understanding` $\rightarrow$ `Thumbnail Objective (1-sec promise)` $\rightarrow$ `Visual Story` $\rightarrow$ `Primary Focal Subject` $\rightarrow$ `Composition Layout` $\rightarrow$ `1–4 Word Text Hook` $\rightarrow$ `Clean Image Generation` $\rightarrow$ `Dynamic Typography Overlay` $\rightarrow$ `Automated QA`.
- **Zero Embedded Text in Image Models**: The AI image prompt must specify `ZERO embedded text or letters` to prevent distorted typography. The text hook is rendered separately via the dynamic frontend canvas layer.
- **Text Strategy**:
  - 1–4 punchy words in all caps.
  - Never copy the full video title.
  - Positioned into the negative space zone opposite the focal subject.
- **Non-Inventive Accuracy**: Do not visually fabricate fictional sci-fi structures (e.g. underground bunkers or laser vaults) for corporate office tours or real-world exploration topics.
