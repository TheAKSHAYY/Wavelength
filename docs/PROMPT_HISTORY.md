# Prompt History

## Overview

This file logs the type of prompting patterns historically used in the project. It is intentionally simple because the project remains prompt-first and research-oriented rather than rule-heavy.

## Common Pattern

The app typically uses a system prompt that defines the assistant persona and a user prompt that defines the task.

Example command pattern:

```json
{
  "system": "You are a strategic YouTube growth advisor.",
  "prompt": "Identify 5 trending content angles around AI education.",
  "useWebSearch": true
}
```

## Typical Prompt Themes

- competitor analysis
- keyword research
- niche opportunity discovery
- content idea generation
- title suggestions
- script drafting
- roadmap planning
- strategy recommendations

## Historical Notes

The project originally leaned on a single comprehensive dashboard with prompt-heavy actions. It was later improved by modularizing the UI and background data flow, but the core prompt logic remains central to the application design.

## Future Improvements

- prompt templates per feature
- structured output schemas
- evaluation prompts to check output quality
- prompt versioning and history storing

---

Last updated: 2026-08-03
