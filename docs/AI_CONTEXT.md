# AI Context

## Role of AI in This Project

AI is the primary execution engine for content strategy and generation in this application. The backend uses OpenAI to generate subject matter responses that are then displayed inside the dashboard.

## Prompt-Driven Design

The app does not have a large formal business rules engine for content generation. Instead, it relies on prompt-driven generation to create:

- ideas
- scripts
- keyword summaries
- recommendations
- roadmap sequences
- competitive comments

This makes the system flexible but also means prompt quality matters significantly.

## Architectural Boundary

The AI logic is intentionally isolated behind a backend API route. This is important because:

- secrets stay on the server
- model logic is centralized
- prompt contract changes are easier to manage
- UI code does not directly handle API keys

## Risk Areas

- prompts can be too generic without strong system instructions
- malformed AI responses can break UI parsing
- outputs can be inconsistent across runs
- hallucinations or speculative insights need user review

## AI Guidance for Future Work

When changing AI behavior:

1. update the prompt contract carefully
2. preserve backward compatibility where possible
3. validate parsing and output structure
4. test failure cases and malformed responses
5. document assumptions and limitations

---

Last updated: 2026-08-03
