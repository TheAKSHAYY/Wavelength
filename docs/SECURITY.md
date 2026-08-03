# Security

## Security Summary

This project is designed as a local prototype, not a production-grade platform. The current setup is relatively safe because secrets are kept off the browser, but it still lacks many enterprise-level controls.

## Current Security Controls

- OpenAI API key is expected to live in `.env` and be used only by the backend
- Vite proxy routes `/api` through the backend
- optional token protection can be enabled using `API_TOKEN`
- CORS origin is intentionally limited in `.env.example`

## Risks and Gaps

### API key leakage

Risk: secrets could accidentally be committed or exposed in frontend code.

Mitigation:

- keep all production secrets outside the repo
- never print secrets in logs
- use environment variables only

### Browser-side storage

Risk: localStorage can be accessed or read by browser-based misuse.

Mitigation:

- store only non-sensitive values
- treat all saved data as user-local and non-critical
- avoid storing secrets or tokens in localStorage

### Unauthenticated access

Risk: endpoints could be publicly callable without intention.

Mitigation:

- configure `API_TOKEN` as an extra guard in deployment
- restrict CORS and trusted origins
- place the app behind auth/proxy infrastructure in production

### Prompt injection

Risk: AI prompt behavior can be manipulated if user inputs are not carefully shaped.

Mitigation:

- maintain a clear system prompt
- validate and sanitize user inputs before sending to the model
- avoid passing untrusted values into system instructions

## Recommended Security Enhancements

1. add real authentication and authorization
2. add rate limiting to AI endpoints
3. add server-side logging and request correlation
4. add request size and payload validation
5. add abuse protections and quotas
6. move to secure deployment environment variables
7. add security review for prompt handling

## Security Policy Guidance

For production use:

- avoid exposing the backend publicly without a gateway or reverse proxy
- ensure all environment variables are injected securely
- rotate API keys regularly
- monitor usage and failures
- use HTTPS in deployment

---

Last updated: 2026-08-03
