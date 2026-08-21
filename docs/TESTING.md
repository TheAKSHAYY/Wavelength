# Wavelength Testing Strategy

## Overview

Wavelength employs a multi-tiered testing strategy ensuring reliability across unit math/formatting utilities, authentication security, schema parsing, and cross-domain AI intelligence generation.

---

## 1. Running Automated Tests

### Run All Vitest Unit & Integration Suites
```bash
npm test
```
Executes tests across:
- `server/__tests__/auth.test.ts`: Password hashing, token signing, session verification.
- `server/__tests__/intelligence.test.ts`: Title, Script, and Thumbnail Intelligence engines across 12 diverse niches.
- `src/lib/__tests__/parse.test.ts`: AI JSON extraction and markdown schema normalization.
- `src/lib/__tests__/format.test.ts`: Number, date, and percentage formatting utilities.
- `src/lib/__tests__/imageGenerator.test.ts`: FLUX URL generation and preset formatting.

---

## 2. Dedicated Domain Test Suites

### 1. YouTube Thumbnail Designer Test Matrix
```bash
npx tsx server/scripts/test-thumbnail-designer.ts
```
Validates the **Two-Stage Thumbnail Design Studio** across 10 cross-domain topics + Google Headquarters acceptance case:
- Objective identification (Curiosity, Warning, Transformation, Discovery, Comparison, etc.).
- Visual story & 1 dominant focal subject.
- Dynamic composition layouts (`LEFT_TEXT_RIGHT_SUBJECT`, `RIGHT_TEXT_LEFT_SUBJECT`, `SPLIT_COMPARISON`).
- 1–4 word punchy text strategy with zero title duplication.
- Automated QA checkpoints.

### 2. Image Pipeline Audit Matrix
```bash
npx tsx server/scripts/test-image-pipeline.ts
```
Validates 12 topics against coder/developer contamination checks and live FLUX image rendering (1280x720 16:9 HD JPEG).

### 3. Multilingual Verification Suite
```bash
npx tsx server/scripts/verify-topics.ts
```
Tests end-to-end multilingual title and script generation across English, Hindi (Devanagari), and creator Hinglish.
