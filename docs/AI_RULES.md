# AI Rules

## Core Rules for AI-Assisted Work

1. Keep secrets server-side.
2. Preserve the project’s current architecture unless a clear reason exists to change it.
3. Prefer small, explainable changes over risky rewrites.
4. Update documentation when behavior or contracts change.
5. Treat AI output as advisory, not authoritative.
6. Keep prompts centralized and understandable.
7. Validate generated output for structure and meaning.
8. Do not expose private keys, tokens, or credentials in code or docs.

## Prompt and Contract Rules

- Keep the request and response contract explicit.
- Avoid changing model calls without reviewing downstream parsing logic.
- Ensure the frontend can handle empty or malformed data gracefully.
- Prefer structured output where the app requires it.

## Operational Rules

- Always verify build and startup behavior after code changes.
- Avoid introducing undocumented behavior or hidden state.
- Prefer maintainability over cleverness.

---

Last updated: 2026-08-03
