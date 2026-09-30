# 10 — Repository Structure and Development Environment

Covers design-doc sections **13 (Repository structure)** and **15
(Development environment)**.

---

## 1. Repository structure

```
nue/
├── apps/
│   ├── extension/                 Chrome MV3 extension (WXT)
│   │   ├── entrypoints/
│   │   │   ├── probe.content.ts       MAIN world: Monaco observer, net tap, route/visibility
│   │   │   ├── relay.content.ts       ISOLATED world: validate + forward to background
│   │   │   ├── background.ts          service worker: session manager, compactor, uploader
│   │   │   └── popup/                 status + pause/end/discard
│   │   ├── src/
│   │   │   ├── capture/               monaco-observer.ts, net-tap.ts, context-observer.ts
│   │   │   ├── platform/leetcode.ts   ALL LeetCode-specific knowledge (URLs, payload shapes, slug extraction)
│   │   │   ├── session/               session-manager.ts, boundaries.ts, store.ts (IndexedDB), uploader.ts
│   │   │   └── privacy/redact.ts
│   │   └── wxt.config.ts              manifest: permissions live here, and CI guards them
│   ├── web/                       React SPA (Vite + TanStack Router/Query + Tailwind)
│   │   └── src/{routes,components,api,lib}/
│   └── server/                    ONE deployable, two entrypoints
│       ├── src/
│       │   ├── api.ts                 Hono app → HTTP
│       │   ├── worker.ts              pg-boss consumer → pipeline jobs, crons
│       │   ├── env.ts                 zod-validated environment
│       │   ├── db/                    drizzle schema.ts, client.ts
│       │   └── modules/{identity,ingest,pipeline,records,memory,privacy}/
│       │        └── routes.ts · service.ts · *.test.ts
│       ├── drizzle/                   generated SQL migrations (committed, reviewed)
│       └── Dockerfile
├── packages/
│   ├── contracts/                 THE boundary: zod schemas + inferred types
│   │   ├── src/capture.ts             ops, revisions, checkpoints, results, context events
│   │   ├── src/trace.ts               SessionTrace (upload payload)
│   │   ├── src/api.ts                 request/response DTOs
│   │   ├── src/record.ts              LearningRecord + Claim
│   │   ├── src/render/markdown.ts     deterministic Markdown renderer
│   │   └── taxonomy/*.json            patterns, concepts, mistakes, approaches
│   ├── analysis/                  deterministic, isomorphic (runs in extension AND server)
│   │   ├── src/replay.ts              ops → code at version
│   │   ├── src/compact.ts             ops → revisions (coalescing rules)
│   │   ├── src/features/              tree-sitter structural features (+ queries/*.scm per language)
│   │   ├── src/diff.ts                line/structural diffs, fix localization
│   │   ├── src/segment.ts             attempt segmentation
│   │   ├── src/results.ts             execution facts, mistake candidates
│   │   ├── src/metrics.ts             active time, time-to-insight
│   │   └── src/trace-text.ts          compact text rendering for LLM input
│   └── pipeline/                  Node-only: orchestrator + LLM stages + validation + evals + CLI
│       ├── src/llm/                   LlmClient interface, anthropic.ts, fake.ts
│       ├── src/stages/                profile.ts, reason.ts, validate.ts, synthesize.ts, classify.ts, render.ts
│       ├── src/prompts/               *.md prompt templates, versioned in file header
│       ├── src/run.ts                 runPipeline(trace, deps) → { record, stageOutputs, metrics }
│       ├── src/cli.ts                 `nue analyze` (V0)
│       └── evals/                     eval runner + rubric
├── tools/
│   └── fake-leetcode/             local page with real Monaco + mock run/submit/check endpoints
├── fixtures/
│   └── traces/                    golden sessions: <slug>-<n>.trace.json + .labels.json
├── infra/
│   └── render.yaml                (V1) deploy blueprint
├── docs/                          this design, ADRs, spikes
├── .github/workflows/ci.yml
├── package.json · pnpm-workspace.yaml · tsconfig.base.json · biome.json
├── .nvmrc · .editorconfig · .env.example · .gitignore
└── README.md · CLAUDE.md
```

### Why this shape

- **Split packages by *where code must run*, not by topic.**
  - `contracts`: runs everywhere (extension, web, server). Only zod, no I/O.
  - `analysis`: must run in the **browser** (extension compacts ops locally)
    **and** Node (pipeline). So: pure functions, no Node APIs, WASM tree-sitter.
  - `pipeline`: Node-only (LLM SDK, filesystem for CLI/evals). It has **no
    database dependency**: `runPipeline` takes a trace and returns outputs. The
    server's worker adapts it to Postgres, and the V0 CLI adapts it to files.
    That's what lets V0 exist without a server, and makes every stage testable
    without a DB.
- **`apps/server` is one deployable** with two entrypoints. Modules inside are
  the boundaries (see [architecture §4](04-architecture.md#internal-module-boundaries-inside-appsserver)).
  Splitting into services later is easy *because* module boundaries are
  enforced now.
- **All LeetCode-specific knowledge in one file** (`platform/leetcode.ts`, plus
  its fixtures). When LeetCode changes, there is one place to fix. When we add
  NeetCode, we add one sibling file implementing the same `PlatformAdapter`
  interface.
- **`fixtures/` at the root**, because golden traces are used by `analysis`
  tests, `pipeline` evals, server integration tests, and the fake-LeetCode
  replayer.
- **No `services/` folder, no `packages/types`, no `packages/shared`.** "Shared"
  packages become junk drawers. Types live next to the schemas they come from
  (`contracts`).
- **No `packages/database`.** Only the server touches the DB, so the schema
  lives in the server.

Dependency rule (enforced by a lint check on `package.json` deps):

```
contracts  ◄──  analysis  ◄──  pipeline  ◄──  apps/server
    ▲              ▲                            
    │              └───────────────────────────  apps/extension
    └──────────────────────────────────────────  apps/web
```

`web` never imports `analysis` or `pipeline`. `extension` never imports
`pipeline`. Nothing imports from `apps/*`.

---

## 2. Development environment (macOS)

### Runtimes

| Tool | Version | Why | Install |
|---|---|---|---|
| **Node.js** | **26.x** (pinned in `.nvmrc`; becomes Active LTS Oct 2026) | Everything is TypeScript | `brew install fnm && fnm install` (reads `.nvmrc`), or your existing install |
| **pnpm** | 12.x (pinned via `packageManager` in `package.json`) | Workspace package manager | `brew install pnpm`. Note: Node ≥ 25 no longer bundles corepack, so `corepack enable` isn't available by default |
| **PostgreSQL** | 18.x | Local database | `brew install postgresql@18 && brew services start postgresql@18`. Alternatively Postgres.app, or Docker/OrbStack if you prefer containers |
| Chrome | current stable | Extension dev + Playwright | — |
| Python | **not needed** | — | — |
| Rust | **not needed** (no Tauri) | — | — |

Why Homebrew Postgres over Docker: one fewer daemon, no Docker Desktop licence
or VM memory, and Postgres runs natively. The only service we need locally is
Postgres, so Compose buys little. (If a second service ever appears, add
`infra/docker-compose.yml` then.)

### VS Code

`.vscode/extensions.json` recommends: Biome (`biomejs.biome`), Vitest
(`vitest.explorer`), Playwright (`ms-playwright.playwright`), Tailwind CSS
IntelliSense. `.vscode/settings.json` sets Biome as the default formatter,
format-on-save, and organize-imports on save. (TypeScript 7's npm package ships the native `tsc` but not `tsserver`, so VS Code keeps using its built-in language service for editing; `pnpm typecheck` is the source of truth.)

### Tooling decisions

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript 7 (native compiler), `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Contracts are the product. TS 7's Go-based compiler makes `typecheck` fast enough to run constantly |
| Lint + format | **Biome** (single tool) | One fast binary instead of ESLint + Prettier + plugins |
| Tests | **Vitest** (unit/integration), **Playwright** (extension + web E2E) | Vite-native, fast, same config everywhere |
| Build | Vite (web, WXT), `tsc`/`tsdown` for packages only if needed (internal packages can export TS source directly) | Simplest thing: packages consumed as source by Vite/tsx |
| Run TS in Node | `tsx` in dev; compiled JS in prod | No build step in dev |
| Migrations | `drizzle-kit generate` → SQL files committed → `drizzle-kit migrate` | Reviewable SQL in PRs |
| Git hooks | None initially; CI is the gate | Hooks that slow commits get bypassed. Add `lefthook` for format-on-commit if drift appears |

### Environment variables and secrets

- `.env.example` is committed and lists every variable with a comment. `.env` is
  git-ignored.
- Server reads env through `apps/server/src/env.ts` (zod). It **fails fast at
  boot** with a readable error listing missing vars.
- Node loads `.env` natively: `node --env-file-if-exists=.env` (no `dotenv`
  dependency).
- Extension build-time config (`WXT_API_ORIGIN`, `WXT_WEB_ORIGIN`) contains
  **no secrets**. Anything shipped in an extension is public.
- Production secrets live in the PaaS environment settings. Never in the repo,
  never in CI logs.

```bash
# .env.example
DATABASE_URL=postgres://localhost:5432/nue_dev
ANTHROPIC_API_KEY=                       # required for pipeline stages 6/7/9/10 and evals
NUE_MODEL_REASONING=claude-sonnet-5
NUE_MODEL_CLASSIFY=claude-haiku-4-5
BETTER_AUTH_SECRET=                      # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:8787
WEB_ORIGIN=http://localhost:5173
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
RESEND_API_KEY=                          # optional locally: magic links print to console
SENTRY_DSN=                              # optional
POSTHOG_KEY=                             # optional
```

### First-time setup

```bash
git clone https://github.com/sdukea/nue.git && cd nue
fnm install                     # Node from .nvmrc
brew install pnpm postgresql@18
brew services start postgresql@18
createdb nue_dev && createdb nue_test
cp .env.example .env            # fill ANTHROPIC_API_KEY, BETTER_AUTH_SECRET
pnpm install
pnpm db:migrate                 # (V1+)
pnpm test
```

### Everyday commands (root `package.json`)

| Command | Does |
|---|---|
| `pnpm dev` | web (5173) + server api (8787) + worker + fake-leetcode (5174), in parallel |
| `pnpm dev:ext` | WXT dev: builds extension and launches Chrome with it loaded + hot reload |
| `pnpm test` | Vitest across all packages |
| `pnpm test:e2e` | Playwright: extension against fake-leetcode, web against local API |
| `pnpm typecheck` | `tsc --noEmit` per package |
| `pnpm lint` / `pnpm format` | Biome check / write |
| `pnpm check` | lint + typecheck + test: what CI runs |
| `pnpm db:generate` | Drizzle: schema diff → new SQL migration |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |
| `pnpm db:reset` | Drop + recreate + migrate the dev DB |
| `pnpm nue analyze <trace.json>` | V0 CLI: run pipeline on a trace, write record `.md` + `.json` |
| `pnpm eval` | Run LLM eval suite over `fixtures/traces` (costs money; not in CI by default) |

### Git strategy

- **Trunk-based.** `main` is always releasable. Short-lived branches
  (`feat/…`, `fix/…`, `spike/…`) merged by PR, even solo. The PR is where CI
  runs and where you re-read your own diff.
- **Squash-merge**, imperative commit subjects ("Add revision compactor").
- **CI (GitHub Actions)** on every PR: install (cached), Biome, typecheck,
  unit tests, a Postgres service container for server integration tests, and
  the manifest-permissions guard. E2E runs on `main` and on PRs labeled `e2e`.
- **Releases:** the extension is versioned independently (`extension-v0.3.0`
  tags → CI builds the zip → manual Web Store upload). Server + web deploy on
  merge to `main` (Render auto-deploy).
- **Spikes** live on `spike/*` branches and are **not merged**. Their findings
  are merged as `docs/spikes/NNN-*.md`.

### `.gitignore` additions

```
.env
.env.*.local
node_modules/
dist/
.output/            # WXT build output
.wxt/
coverage/
playwright-report/
test-results/
*.tsbuildinfo
.DS_Store
evals/results/raw/  # full LLM outputs stay local; summaries are committed
```
