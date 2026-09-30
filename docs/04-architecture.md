# 04 — Architecture

Covers design-doc sections **8 (Recommended architecture)**, **12 (System
architecture diagram)**, **14 (Technology choices)** and **16 (API
boundaries)**.

---

## 1. Platform decision

| Option | What you get | What it costs | Verdict |
|---|---|---|---|
| **A. Browser extension only** | Capture in the right place, scoped permissions | Nowhere to *read* records well. Popup is tiny, and extension pages have no sync or accounts | Capture half of the answer |
| **B. Desktop app only** | Menu bar presence, native feel | Can't see inside the browser without Accessibility/Screen Recording (see [capture](01-capture.md)). Worst data, worst trust | ❌ |
| **C. Extension + desktop app** | Extension captures, desktop app processes locally | Two install flows, notarization, Rust or Electron, IPC via native messaging. Buys "local-first" at a large complexity cost while the LLM still runs in the cloud | ❌ for now |
| **D. Web app only** | Easy to ship | Can't observe LeetCode at all. Would require re-hosting problems (ToS, and changes user behaviour) | ❌ |
| **E. Extension (capture) + web app (review) + thin cloud API** | Each part does what its platform is best at | A backend to run | ✅ **Chosen** |

### Why E

- **Capture lives where solving lives**: the browser, scoped by Chrome's
  permission model.
- **Reviewing is a reading and studying activity**: a normal web app is the right
  surface (big screen, deep links, works on any device including phones for
  review on the train).
- **A backend is genuinely necessary**, not decorative:
  1. **LLM calls need a secret API key.** It cannot ship inside an extension.
  2. **Cross-device**: capture on laptop, review on phone.
  3. **Background processing**: the pipeline takes 10–60 s and must survive the
     browser closing.
  4. **Aggregation** across hundreds of sessions (mistake profile, SRS).
- The backend is **one deployable** (a modular monolith with two entrypoints),
  not microservices.

### Why not a desktop app

A desktop app earns its keep only when capture leaves the browser. Even then,
the right tool for local IDEs is a **VS Code extension**: same document-change
API shape as Monaco, and no OS-level permissions. The Tauri/Electron question
comes back only if we ever need an offline local LLM runtime, and that's V3+.

### Local-first, pragmatically

"Local processing where possible" is honoured where it matters for privacy:

- **Tier 2 operations** (the most granular data) stay on device by default.
- **Session compaction** (operations → revisions) happens *in the extension*,
  using the same `@nue/analysis` code the server uses.
- **Secret redaction** runs *in the extension* before anything is uploaded.
- LLM inference is cloud-hosted, because local models on a MacBook are not yet
  good enough at this reasoning task, and we'd be shipping a multi-GB runtime.
  The provider interface keeps a local model (Ollama) as a supported
  **opt-in** later for users who want it.

---

## 2. System diagram

```
 ┌────────────────────────── User's Mac ─────────────────────────────────────────┐
 │                                                                               │
 │  Chrome tab: leetcode.com/problems/*                                          │
 │  ┌──────────────────────────────────────────────────────────────┐             │
 │  │ PAGE (MAIN world)                                            │             │
 │  │  window.monaco ──► probe.ts                                  │             │
 │  │  fetch/XHR ──────► net-tap.ts (allowlisted URLs only)        │             │
 │  │  history/visibility ► context.ts                             │             │
 │  │            │ window.postMessage (untrusted channel,          │             │
 │  │            ▼   zod-validated on receipt)                     │             │
 │  │ CONTENT SCRIPT (ISOLATED world) relay.ts                     │             │
 │  └────────────┬─────────────────────────────────────────────────┘             │
 │               │ chrome.runtime.sendMessage                                    │
 │  ┌────────────▼───────────────────────────────────────────────┐               │
 │  │ EXTENSION SERVICE WORKER (stateless)                       │               │
 │  │  session-manager ─► IndexedDB (ops, revisions, sessions)   │               │
 │  │  compactor (@nue/analysis: ops → revisions)                │               │
 │  │  redactor (secrets)                                        │               │
 │  │  uploader (retry queue, idempotent)                        │               │
 │  │  badge + popup                                             │               │
 │  └────────────┬───────────────────────────────────────────────┘               │
 └───────────────┼───────────────────────────────────────────────────────────────┘
                 │ HTTPS  POST /v1/sessions   (device token)
                 ▼
 ┌──────────────────────────── Cloud (one app, two processes) ───────────────────┐
 │                                                                               │
 │  API process (Hono)                         WORKER process (pg-boss)          │
 │  ┌──────────────────────────┐              ┌───────────────────────────────┐  │
 │  │ identity   (Better Auth) │              │ pipeline runner               │  │
 │  │ ingest     (validate,    │── enqueue ──►│  1 normalize      (det.)      │  │
 │  │            store trace)  │   (pg-boss)  │  2 reconstruct    (det.)      │  │
 │  │ records    (read/claims) │              │  3 analyze code   (tree-sitter│  │
 │  │ privacy    (export/del.) │              │  4 segment        (det.)      │  │
 │  │ settings                 │              │  5 results        (det.)      │  │
 │  └────────────┬─────────────┘              │  6 problem profile(LLM,cached)│  │
 │               │                            │  7 reasoning      (LLM)       │  │
 │               │                            │  8 validate       (det.)      │  │
 │               │                            │  9 synthesize     (LLM)       │  │
 │               │                            │ 10 classify       (LLM→enum)  │  │
 │               │                            │ 11 aggregate      (SQL)       │  │
 │               │                            └──────┬─────────────┬──────────┘  │
 │               ▼                                   ▼             │ HTTPS       │
 │  ┌─────────────────────────────────────────────────────┐        ▼             │
 │  │ PostgreSQL                                          │   LLM provider       │
 │  │  app tables · pg-boss queue · pipeline_runs         │   (Anthropic API)    │
 │  └─────────────────────────────────────────────────────┘                      │
 └───────────────▲───────────────────────────────────────────────────────────────┘
                 │ HTTPS (session cookie)
 ┌───────────────┴──────────────┐
 │ Web app (static SPA on CDN)  │   Home · History · Record · Settings
 └──────────────────────────────┘
```

### Data flow, end to end

1. You type in Monaco. `probe.ts` receives `onDidChangeContent` and posts an
   `op` message. `relay.ts` validates it and forwards it to the service worker.
2. The service worker appends the op to IndexedDB **immediately** (it may be
   killed at any moment), and the compactor updates the pending revision.
3. You click Run. `net-tap.ts` sees `POST …/interpret_solution/`, extracts
   `typed_code` + `lang` → `checkpoint` event. It then sees the `…/check/`
   poll response reach a terminal state → `execution_result` event.
4. Session ends (Accepted + 10 min idle, etc.). The service worker finalizes the
   **SessionTrace** (revisions + checkpoints + results + context), runs
   redaction, and uploads with an idempotency key.
5. API validates against `@nue/contracts`, stores the trace, enqueues
   `pipeline.run`, and returns `202`.
6. Worker runs the stages ([AI pipeline](05-ai-pipeline.md)), writes the
   record, and records a `pipeline_run` row (timings, tokens, cost, versions,
   validation failures).
7. Web app polls or loads `/v1/sessions/:id/record` and renders it.

---

## 3. Technology choices, from first principles

For each: **what it is → why we need it → alternatives → why this one.**

### One language: TypeScript everywhere

- **What:** extension, web app, API, worker and pipeline all in TypeScript
  (strict).
- **Why:** the most important thing in this system is the **data contracts**
  (capture events → trace → record). The extension *must* be TS/JS, and so
  must the web app. If the backend is also TS, the *same* zod schema validates
  an event in the extension, at the API boundary, and in pipeline tests, so
  the contract can't drift. The deterministic analysis code (op replay,
  revision compaction) must also run **in the extension** *and* the server, so
  it can only be written once in TS.
- **Alternative: Python backend (FastAPI).** Python's advantage is the ML
  ecosystem (training, local models, numpy). We don't train models. We call
  hosted LLM APIs (first-class TS SDKs), parse code (tree-sitter has WASM
  bindings), and diff text. We'd pay for a second toolchain, duplicated
  schemas (Pydantic ↔ zod), and a codegen step, with no benefit.
- **Revisit when:** we do real ML (e.g., training a classifier on thousands of
  labeled sessions). Then add a small Python job, not a rewrite.

### pnpm workspaces (monorepo)

- **What:** one repo, multiple packages, linked locally.
- **Why:** contracts shared across 3 apps. Atomic commits across boundaries.
- **Alternatives:** npm workspaces (slower, looser hoisting), Nx/Turborepo
  (task graph + caching, valuable at 15+ packages, overhead at 6).
- **Chosen:** pnpm (strict `node_modules` catches undeclared deps). Add
  Turborepo only if CI gets slow.

### Extension: WXT + Manifest V3

- **What:** WXT is a thin Vite-based framework for web extensions: it generates
  the manifest, handles MAIN/ISOLATED content-script entrypoints, gives dev
  reload, and builds for Chrome/Firefox/Safari from one codebase.
- **Why:** MV3 build plumbing (multiple entrypoints, manifest, HMR, zip) is
  pure boilerplate. WXT's abstractions are shallow (entrypoint files map to
  manifest entries).
- **Alternatives:** hand-rolled Vite/esbuild config (fine, more plumbing),
  Plasmo (heavier, more magic, slower-moving), CRXJS (maintenance gaps).
- **Chosen:** WXT. The capture logic itself lives in plain TS modules that
  don't import WXT, so switching later costs little.

### Web app: React + Vite SPA (TanStack Router + TanStack Query)

- **What:** a static single-page app served from a CDN, talking to the API.
- **Why:** everything is behind login, so SSR/SEO buys nothing. The record page
  is interactive (timeline scrubber, claim confirmation). Static hosting is
  cheap and simple. Keeping the SPA separate from the API forces a clean HTTP
  boundary.
- **Alternatives:** Next.js (SSR, server actions, blurs client/server
  boundaries and adds deploy coupling; valuable for a marketing site, which can
  be a separate simple site later), SvelteKit/Solid (fine, smaller
  ecosystems).
- **Styling:** Tailwind CSS + a handful of hand-built components (Radix
  primitives where accessibility is hard: dialogs, popovers).

### API: Hono on Node

- **What:** a small, standards-based (Fetch API) HTTP framework.
- **Why:** tiny surface area, first-class zod validation, and a **typed RPC
  client (`hc`)** so the web app gets end-to-end types from route definitions
  without tRPC/GraphQL machinery.
- **Alternatives:** Express (untyped, dated), Fastify (good; heavier plugin
  model), NestJS (❌ decorators, DI container: the "huge framework / magic"
  we're avoiding), tRPC (couples client to server more tightly than we want for
  an extension client).

### Background jobs: pg-boss (Postgres-backed queue)

- **What:** a job queue whose storage is tables in our existing Postgres.
- **Why:** the pipeline must run outside the request, retry on failure, and
  be observable. We already have Postgres. pg-boss gives retries, backoff,
  singleton keys, scheduling (cron for aggregation), and dead-letter handling,
  with **no new infrastructure**.
- **Alternatives:** BullMQ (needs Redis), Temporal/Inngest (durable-workflow
  engines: great, but a second system to learn and run), SQS (cloud lock-in).
- **Revisit when:** > ~50 jobs/sec sustained. Far away.

### Database: PostgreSQL + Drizzle

- **What:** relational database; Drizzle is a thin TypeScript schema + query
  builder that stays close to SQL, with SQL migrations via `drizzle-kit`.
- **Why Postgres:** our data is deeply relational (user → problems → sessions →
  revisions → claims → evidence). We need transactions, cascading deletes
  (hard delete is a privacy feature), JSONB for versioned documents (records),
  and later `pgvector` in the *same* DB if we need embeddings.
- **Why not SQLite:** great for local, but we need a multi-process server
  (API + worker) and managed backups. SQLite *is* used in the extension
  conceptually (IndexedDB plays that role).
- **Why Drizzle:** schema in TS (shared types), generated **plain SQL**
  migration files you can read and review, no runtime magic. Prisma
  (alternative) has a separate schema language, a query engine binary, and
  hides SQL. Kysely (alternative) is excellent but has no schema/migration
  story.

### Vector search: none (initially)

- **Why none:** "similar problems" and pattern links come from a **curated
  taxonomy** (deterministic, explainable) and LeetCode's own tags. Mistake
  clustering uses categorized enums. There's no retrieval problem yet.
- **When:** if we add free-text search over notes, or similarity between
  *user-described* mistakes, add `pgvector` to the existing Postgres. Never a
  separate vector DB at this scale.

### AI: provider interface + Anthropic Claude

- **What:** an `LlmClient` interface (`generateStructured<T>(schema, prompt,
  opts)`) with one production implementation (Anthropic) and one **fake**
  (fixture-backed) for tests.
- **Models:** `claude-sonnet-5` for reasoning inference and synthesis (the
  quality-critical stages); `claude-haiku-4-5` for classification into taxonomy
  enums (cheap, fast). Model IDs are config, not code.
- **Why a thin interface, not LangChain & co.:** we need exactly three things:
  structured output, retries, and token/cost accounting. A 100-line module does
  that transparently. Frameworks add abstraction exactly where we need to see
  what's happening.
- **Structured output:** JSON schema derived from zod → tool/structured-output
  mode → zod-validate the response → one repair retry with the validation
  error → fail the stage (never silently accept malformed output).
- **Local models:** the interface allows an Ollama implementation later for
  "local-only mode". Not V1.

### Code analysis: web-tree-sitter

- **What:** incremental parser with grammars for Python, Java, C++, JS/TS, Go, …
  running as WASM in Node *and* the browser.
- **Why:** deterministic structural facts ("nested loop over same array",
  "uses dict", "recursion", "sorts input", "while lo <= hi") are more reliable
  than asking an LLM, and they're free. Tolerant of partial/broken code (it
  produces error nodes instead of failing), which matters because mid-solve
  code rarely parses.

### Spaced repetition: FSRS (`ts-fsrs`), V1.5

- **What:** the Free Spaced Repetition Scheduler, a modern, open, well-studied
  algorithm (default in Anki since 23.10).
- **Why:** gives per-card *stability* and *retrievability*. That is literally
  "when will you forget this", which is feature J for free.

### Auth: Better Auth (self-hosted library)

- **What:** a TypeScript auth library that runs inside our Hono server and
  stores users/sessions in our Postgres.
- **Why:** email magic links + GitHub/Google OAuth, sessions, no per-MAU
  pricing, no vendor holding user identities, and data stays in our DB (so
  account deletion is one transaction).
- **Alternatives:** Clerk/Auth0 (fast to start, vendor lock-in, user data
  elsewhere, per-MAU pricing), Supabase Auth (ties us to Supabase), hand-rolled
  (❌ never).
- **Extension auth:** a separate **device token**. See API boundaries below.

### Deployment: one PaaS (Render), Postgres managed

- **What:** Render runs the API (web service), the worker (background worker),
  and the SPA (static site), with managed Postgres, all declared in a
  `render.yaml` blueprint.
- **Why:** two processes + one DB + static files is the whole footprint. No
  Kubernetes, no Terraform yet. Preview environments per PR.
- **Alternatives:** Fly.io (more control, more ops), Railway (similar),
  AWS (ECS+RDS: powerful, heavy for a team of one), Vercel (great for the SPA,
  awkward for long-running workers).
- The app is a plain Node process in a Dockerfile, so moving providers is cheap.

### Observability

| Concern | Tool | Rule |
|---|---|---|
| Logs | `pino` structured JSON | Never log code, trace contents, or LLM prompts/outputs in prod logs. Log IDs. |
| Errors | Sentry (API, worker, web, extension) | `beforeSend` scrubber strips request bodies and any `code`/`text` fields |
| AI pipeline | `pipeline_runs` + `stage_runs` tables | Per stage: duration, model, prompt version, tokens, cost, validation failures, retries |
| Product analytics | PostHog | Explicit events only. Autocapture **off**. Session replay **off**. No content in properties |
| Quality | `claim_feedback` table | Confirm/reject rates by claim type, prompt version: the key quality dashboard |

### Email: Resend (magic links, optional notifications)

---

## 4. API boundaries

### Three clients, three trust levels

| Client | Auth | Can do |
|---|---|---|
| Web app | HTTP-only session cookie (Better Auth), SameSite=Lax, CSRF-protected | Everything for its own user |
| Extension | **Device token** (random 256-bit, hashed at rest, revocable, scoped `capture:write`, `config:read`) | Upload sessions, read capture config, delete its own pending sessions |
| Worker | In-process (no HTTP) | Pipeline writes |

### Pairing flow (extension ↔ account)

```
Extension                       Web app (logged in)                 API
    │ open nue.app/connect?ext=1      │                               │
    │────────────────────────────────►│ POST /v1/devices              │
    │                                 │──────────────────────────────►│ create device,
    │                                 │◄──────── { deviceToken } ─────│ return token once
    │◄── chrome.runtime.sendMessage ──│  (externally_connectable       │
    │    (EXT_ID, {deviceToken})      │   restricted to nue.app)       │
    │ store in chrome.storage.local   │                               │
```

`externally_connectable.matches` = the Nue web origin only, so no other site can
message the extension.

### Endpoints (V1)

All under `/v1`, JSON, zod-validated. Request/response types live in
`@nue/contracts`.

**Extension → API**

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/sessions` | Upload a finalized `SessionTrace`. Header `Idempotency-Key: <clientSessionId>`. → `202 {sessionId}` |
| `GET` | `/v1/capture-config` | Global pause, upload-ops opt-in, retention, excluded problems |
| `DELETE` | `/v1/sessions/by-client-id/:clientSessionId` | Discard (if already uploaded) |

**Web → API**

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/me` | User + settings |
| `GET` | `/v1/home` | Today summary, needs-attention list, recent |
| `GET` | `/v1/problems` | History (filters: pattern, outcome, difficulty, date) |
| `GET` | `/v1/problems/:problemId` | All sessions for a problem |
| `GET` | `/v1/sessions/:id` | Session + status (`processing`, `ready`, `failed`) |
| `GET` | `/v1/sessions/:id/record` | Learning record (latest version) |
| `GET` | `/v1/sessions/:id/timeline` | Revisions + executions (for scrubber) |
| `PATCH` | `/v1/claims/:id` | `{verdict: confirmed\|rejected\|edited, text?}` |
| `POST` | `/v1/sessions/:id/regenerate` | Re-run pipeline (new record version) |
| `DELETE` | `/v1/sessions/:id` | Hard delete session + derived data |
| `GET/PATCH` | `/v1/settings` | Capture + privacy settings |
| `GET/DELETE` | `/v1/devices[/:id]` | List/revoke paired browsers |
| `POST` | `/v1/export` | Start export job → download link (JSON + Markdown zip) |
| `DELETE` | `/v1/account` | Hard delete everything (with confirmation token) |

### Internal module boundaries (inside `apps/server`)

```
apps/server/src/modules/
  identity/   users, auth, devices            ─ owns: user, device, auth tables
  ingest/     accept + validate traces        ─ owns: session, revision, execution, context_event
  pipeline/   job handlers, stage orchestration ─ reads ingest, writes records
  records/    learning records, claims, feedback ─ owns: learning_record, claim, claim_evidence
  memory/     aggregates, mistakes, (V1.5) reviews ─ owns: user_concept_stat, mistake, review_card
  privacy/    export, delete, retention sweeps
```

Rules: a module exposes a `service.ts` (functions) and `routes.ts` (HTTP).
Other modules call **services, never tables they don't own**. No module imports
another module's `db/` files. That's the whole "architecture framework": a
folder convention and an import-lint rule.
