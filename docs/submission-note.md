# ROOT Challenge Submission Note

## Implementation Idea

Mini Atoms Builder recreates the core Atoms-style loop in a compact demo: a user enters a product idea, the system shows multiple agent roles working through the request, then returns a generated app preview and file set. The app is designed as a builder workspace instead of a static showcase.

## Key Tradeoffs

- ModelScope is the primary LLM path through the OpenAI-compatible SDK.
- A deterministic local generator is kept as a fallback so reviewers can still use the demo when the external API is unavailable.
- LocalStorage persistence is always enabled; Supabase persistence is enabled when deployment environment variables are configured.
- The generated output is a blueprint and preview schema rather than a fully sandboxed code runtime, which keeps the 6-8 hour version reliable and inspectable.

## Completed

- Real prompt interaction and streaming generation endpoint
- Agent timeline
- Live preview with clickable actions
- Generated file browser
- Save, reload, visual edit, and remix workflow
- Browser persistence and Supabase-ready API routes
- Test coverage for generation templates, parsing, ModelScope config, project state, persistence, and preview interaction

## Future Expansion

1. Add a sandboxed runtime to execute generated React files directly.
2. Add auth and shared project links.
3. Add diff view between generations.
4. Add deployment automation for a generated app.
5. Add richer model evaluation for invalid JSON repair.
