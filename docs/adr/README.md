# Architecture Decision Records

Short records of decisions that are expensive to reverse. Format: context →
decision → consequences. Supersede by adding a new ADR; don't edit accepted
ones except to mark them superseded.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-capture-via-scoped-extension.md) | Capture via a site-scoped browser extension observing Monaco + run/submit traffic; no keystrokes | Accepted |
| [0002](0002-typescript-everywhere.md) | TypeScript across extension, web, server and pipeline | Accepted |
| [0003](0003-modular-monolith-postgres-queue.md) | One server deployable (API + worker), Postgres as DB and queue | Accepted |
| [0004](0004-observed-vs-inferred.md) | Facts are computed; the LLM only produces evidence-cited claims | Accepted |
| [0005](0005-no-desktop-app.md) | No desktop app until capture must leave the browser | Accepted |
| [0006](0006-revisions-not-ops-server-side.md) | Server stores revisions, not operations; ops stay on device by default | Accepted |
