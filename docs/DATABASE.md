# Database and Persistence Plan

## Current State

This project does not currently use a traditional relational or document database. Instead, it stores generated content in the browser using the Web Storage API (`localStorage`).

## Why No Database Exists Yet

The project is currently structured as a local, prototype-grade dashboard. The focus has been on rapid UI development and AI-assisted workflows rather than a full persistent backend data layer.

## Current Persistence Model

### Browser persistence

The application saves dashboard artifacts in local storage, such as:

- trends
- recommendations
- generated ideas
- scripts
- research summaries
- roadmap plan entries
- calendar-related state

This provides a lightweight persistence mechanism without requiring a backend database.

## Risks of the Current Model

- data is local to a single browser/device
- no user account or shared workspace model
- no versioning or rollback history
- no encryption or additional security controls
- no backup or restore strategy
- no audit trails or data retention policy

## Recommended Future Database Architecture

### Option A: PostgreSQL + application data model

Recommended if the product grows into a real SaaS or creator platform.

Use PostgreSQL for:

- users and subscriptions
- workflows and projects
- generated content objects
- publishing plans and media assets
- analytics events and audit logs

### Option B: Firebase or Supabase

Suitable for a faster MVP with auth, realtime features, and simpler data modeling.

Benefits:

- easier auth setup
- managed database and realtime APIs
- faster time-to-market for a modern SaaS

## Data Model Ideas for the Future

### User

- id
- email
- name
- created_at
- subscription_tier

### Project

- id
- user_id
- title
- niche
- status
- created_at

### ContentIdea

- id
- project_id
- title
- description
- source_summary
- created_at

### ContentPlan

- id
- project_id
- video_number
- title
- objective
- published_at

### ScriptDraft

- id
- project_id
- title
- body
- outline
- status

## Recommended Production Practices

- use environment-based configuration
- encrypt sensitive fields where needed
- add database migrations
- use backup and restore procedures
- log access and creation events
- maintain schema versioning

## Conclusion

The current app is intentionally simple and local-first. The architecture is appropriate for an MVP, but a real product will need persistent server-side storage and stronger data governance.

---

Last updated: 2026-08-03
