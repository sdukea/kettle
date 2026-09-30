# ADR 0003: Modular monolith with Postgres as database and queue

- **Status:** Accepted (2026-10-01)

## Context
We need an HTTP API, background pipeline jobs (10–60 s, retryable), crons
(retention, aggregation), and relational storage. Team size: one.

## Decision
`apps/server` is a single codebase and image with two entrypoints: `api.ts`
(Hono) and `worker.ts` (pg-boss). PostgreSQL stores application data **and**
the job queue. Internal modules (identity, ingest, pipeline, records, memory,
privacy) own their tables and expose services. Cross-module table access is
forbidden.

## Consequences
- One database to run, back up, and delete from. No Redis, no broker.
- Module boundaries keep a future split possible without paying for it now.
- pg-boss throughput limits (far beyond our needs) are the eventual ceiling.
