# ADR 0002: TypeScript everywhere

- **Status:** Accepted (2026-10-01)

## Context
The extension and web app must be TypeScript/JavaScript. The capture contracts
(events → trace → record) are the system's most important interfaces.
Deterministic analysis (op replay, compaction) must run both in the extension
and on the server. We call hosted LLM APIs rather than training models.

## Decision
Use TypeScript (strict) for the extension, web app, server, and pipeline, in a
pnpm workspace. Contracts are zod schemas in `@nue/contracts`.

## Consequences
- One schema validates data at every boundary, with no codegen and no drift.
- `@nue/analysis` is written once and runs in the browser and Node.
- We give up Python's ML ecosystem. Revisit (as an additional job, not a
  rewrite) if we start training models on labeled sessions.
