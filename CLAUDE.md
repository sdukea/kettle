# CLAUDE.md

Guidance for AI coding sessions in this repo. Humans: see README.md and docs/.

## What this is

Nue captures how a user solves LeetCode problems (via a site-scoped Chrome
extension) and turns the trace into a structured learning record. Design lives
in `docs/`. Read `docs/README.md` first, and the ADRs in `docs/adr/` before
changing anything they cover.

## Non-negotiables

- **Never add capture of keystrokes, cursor, screen, cookies, request headers,
  or anything outside `https://leetcode.com/problems/*`.** Extension
  permissions change only with a doc + ADR update.
- **Never help the user solve while solving.** No in-editor hints.
- **Facts are computed, not generated.** LLM output is only evidence-cited
  claims, validated deterministically (ADR 0004). Don't use an LLM for anything
  deterministic code can do.
- **Never log code, trace contents, or prompts/outputs** in server logs or
  error reports. Log IDs.
- **Never store problem statement text.**

## Architecture rules

- TypeScript strict everywhere. zod schemas in `packages/contracts` are the
  source of truth for every boundary.
- Package dependency direction: `contracts ← analysis ← pipeline ← apps/server`;
  `apps/extension` may use `contracts` + `analysis`; `apps/web` only
  `contracts`.
- `packages/analysis` must stay isomorphic (no Node APIs). It runs in the
  extension.
- `packages/pipeline` has no database dependency.
- In `apps/server`, modules call each other's `service.ts`, never each other's
  tables.
- All LeetCode-specific knowledge lives in the platform adapter.

## Workflow

- `pnpm check` must pass before committing.
- Commit small and often, with imperative subject lines.
- Tests: pure functions get unit/property tests; LeetCode parsing gets contract
  tests against `fixtures/leetcode`; nothing in CI calls a real LLM or
  LeetCode.
