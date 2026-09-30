# 11 — Build Plan and Testing Strategy

Covers design-doc sections **17 (Build phases)** and **18 (Testing
strategy)**.

Each phase ends with something that **works and is tested**. Phases 1–7 are
V0 (no server). The V0 gate (Phase 7) decides whether Phases 8+ happen as
planned.

---

## Phase 0: Repo and tooling ✅ (this commit series)

- **Files:** `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`,
  `biome.json`, `.nvmrc`, `.editorconfig`, `.env.example`, `.gitignore`,
  `.vscode/*`, `.github/workflows/ci.yml`, `README.md`, `CLAUDE.md`, `docs/`.
- **Works at end:** `pnpm install && pnpm check` passes on an empty workspace in
  CI.

## Phase 1: Capture spike, logged in (1–2 days, throwaway)

- **Goal:** close the open questions from [Spike 001](spikes/001-leetcode-editor-probe.md).
- **Build:** a ~150-line unpacked extension on branch `spike/capture` with one
  MAIN-world script that logs Monaco ops, wraps `fetch`/XHR for URLs matching
  `/interpret_solution/|/submit/|/submissions/detail/\d+/check/`, and logs
  route changes.
- **Do:** solve 3 problems (Python, Java, one with a compile error, one with WA,
  one with TLE), use Run with custom input, switch language, reset code, open
  Editorial.
- **Output:** `docs/spikes/002-run-submit-network.md` with exact endpoint
  shapes, and **scrubbed** recorded payloads committed to
  `fixtures/leetcode/network/*.json`. These become contract-test fixtures.
- **Works at end:** we know exactly which fields carry code, verdicts, errors,
  and failing inputs, or we've switched the fallback plan to DOM result-panel
  parsing.

## Phase 2: Contracts

- **Files:** `packages/contracts/src/{capture,trace,record,api}.ts`,
  `taxonomy/{patterns,concepts,mistakes,approaches}.json`, `src/taxonomy.ts`.
- **Interfaces:**
  ```ts
  type CaptureEvent =
    | { kind: "op"; seq; t; versionId; changes: Change[]; isUndo; isRedo; isFlush }
    | { kind: "checkpoint"; seq; t; trigger: "run" | "submit"; code; lang; customInput?: string }
    | { kind: "execution_result"; seq; t; checkpointSeq; verdict; error?; failingCase?; stats? }
    | { kind: "context"; seq; t; type: ContextType; data? };
  type SessionTrace = { schemaVersion: 1; clientSessionId; captureVersion; problem: ProblemRef;
                        language; startedAt; endedAt; endReason; signalTiers;
                        revisions: Revision[]; executions: Execution[]; context: ContextEvent[] };
  ```
- **Tests:** schema round-trip; taxonomy IDs unique; every mistake category has
  a group; fixtures parse.
- **Works at end:** every other package can import the vocabulary.

## Phase 3: Fake-LeetCode harness

- **Files:** `tools/fake-leetcode/{index.html,src/main.ts,src/mock-api.ts,vite.config.ts}`.
- **Build:** a page at `http://localhost:5174/problems/two-sum/` that loads
  real Monaco, exposes `window.monaco`, has Run/Submit buttons calling mock
  endpoints with the **same URL shapes and payloads as the Phase 1 fixtures**,
  and a scriptable result mode (`?verdict=wrong_answer`). Includes a **replay
  mode** that plays a recorded trace's ops into the editor at speed ×N.
- **Why:** deterministic, offline, ToS-safe development and E2E tests. Never
  hit LeetCode in CI.
- **Works at end:** you can "solve" a problem locally and see the network calls.

## Phase 4: Extension capture (V0)

- **Files:** `apps/extension/entrypoints/{probe.content.ts,relay.content.ts,background.ts,popup/}`,
  `src/capture/{monaco-observer,net-tap,context-observer}.ts`,
  `src/platform/leetcode.ts`, `src/session/{session-manager,boundaries,store}.ts`,
  `packages/analysis/src/{replay,compact}.ts`.
- **Interfaces:**
  ```ts
  interface PlatformAdapter {
    matchProblemUrl(url: string): { slug: string } | null;
    readProblemMeta(): ProblemRef | null;               // __NEXT_DATA__
    findSolutionModel(monaco): MonacoModel | null;
    classifyRequest(url: string): "run" | "submit" | "check" | null;
    parseCheckpoint(body: unknown): { code: string; lang: string; customInput?: string } | null;
    parseResult(body: unknown): ExecutionResult | "pending" | null;
    classifyRoute(url: string): ContextType | null;      // /editorial, /solutions …
  }
  function compact(ops: Op[], opts: CompactOptions): Revision[];          // analysis
  function decideBoundary(state: SessionState, ev: CaptureEvent | Tick): BoundaryDecision;  // pure
  ```
- **Popup:** status, pause, end, discard, list of local sessions with
  **Export JSON**.
- **Tests:** `compact` property tests (replaying all ops == final code; every
  checkpoint has a revision); `decideBoundary` table tests; `leetcode.ts`
  contract tests against `fixtures/leetcode/network/*`; **Playwright**: load
  extension, open fake-leetcode, type/delete/run/submit via Monaco API, export
  trace, assert structure.
- **Works at end:** you solve on real LeetCode with the unpacked extension
  and export a trace JSON.

## Phase 5: Deterministic analysis

- **Files:** `packages/analysis/src/{features/,features/queries/python.scm,diff,segment,results,metrics,trace-text}.ts`.
- **Interfaces:** `extractFeatures(code, lang): StructuralFeatures`,
  `diffRevisions(a, b): RevisionDiff`, `segment(revisions, features, context): Attempt[]`,
  `analyzeResults(executions, revisions): { facts; fixDiffs; mistakeCandidates }`,
  `computeMetrics(trace, attempts): SessionMetrics`,
  `renderTraceText(trace, analysis, budget): string`.
- **Golden data:** your first 10 real traces → `fixtures/traces/*.trace.json`
  with hand-written `*.labels.json` (attempt boundaries, approach per attempt,
  mistakes, turning point, what you were actually thinking). **Write labels
  right after solving.**
- **Tests:** feature detectors per construct (table tests on code snippets,
  including broken code); segmentation against labels (report precision/recall
  of boundaries, not just pass/fail); snapshot tests of `renderTraceText`.
- **Works at end:** `pnpm nue analyze --no-llm trace.json` prints attempts,
  metrics, and mistake candidates. That's already an "observed-only" record.

## Phase 6: AI pipeline

- **Files:** `packages/pipeline/src/llm/{client,anthropic,fake}.ts`,
  `src/stages/{profile,reason,validate,synthesize,classify,render}.ts`,
  `src/prompts/*.md`, `src/run.ts`, `src/cli.ts`, `evals/{run,rubric}.ts`.
- **Interfaces:**
  ```ts
  interface LlmClient {
    generateStructured<T>(req: { schema: ZodType<T>; system: string; prompt: string;
      model: string; maxTokens: number; cacheKey?: string }): Promise<{ value: T; usage: Usage }>;
  }
  type Stage<I, O> = { id: StageId; version: string; run(input: I, deps: Deps): Promise<O> };
  function runPipeline(trace: SessionTrace, deps: Deps, opts?: { from?: StageId; signal?: Tier[] }):
    Promise<{ record: LearningRecord; stages: StageOutput[]; metrics: PipelineMetrics }>;
  ```
- **Tests:** `validate` unit tests with crafted bad claims (missing refs,
  fake quotes, time-order violations); full pipeline with `FakeLlmClient`
  returning fixture outputs (deterministic, runs in CI); Markdown renderer
  snapshot; `pnpm eval` (real model, manual) scores the golden set.
- **Works at end:** `pnpm nue analyze trace.json` → `two-sum.md` you'd want to
  read.

## Phase 7: V0 evaluation (the gate)

- **Do:** 30 real sessions, ablation (`--signal=t0|t01|t012`), blind comparison
  vs. your own notes and the editorial, and record results in
  `docs/evals/v0-results.md`. Iterate prompts ≤ 2 rounds.
- **Decide:** proceed to V1 as designed / adjust the record design / rethink
  capture.
- **Works at end:** a written, evidence-backed go/no-go.

---

## Phase 8: Server foundation

- **Files:** `apps/server/src/{api,worker,env}.ts`, `src/db/{schema,client}.ts`,
  `drizzle/0000_*.sql`, `src/modules/identity/{routes,service,auth}.ts`.
- **Build:** Hono app with `/healthz`, Better Auth (email magic link printed to
  console in dev; GitHub OAuth), `device` table + `POST /v1/devices` + token
  middleware.
- **Tests:** integration tests against `nue_test` DB (transaction-per-test);
  auth flows; device token hashing; **IDOR suite scaffold** (every route: other
  user's ID → 404).
- **Works at end:** sign in on localhost, create a device token via curl.

## Phase 9: Ingest + worker

- **Files:** `modules/ingest/*`, `modules/pipeline/{jobs,persist}.ts`,
  `modules/records/service.ts`.
- **Build:** `POST /v1/sessions` (idempotent), pg-boss queue `pipeline.run`,
  worker adapts `runPipeline` → `stage_run`/`attempt`/`session_metrics`/
  `learning_record`/`claim` rows; resume-from-failed-stage; `problem.profile`
  job.
- **Tests:** upload the same trace twice → one session; kill worker mid-run →
  resumes; pipeline failure → `status=failed` with error; fake LLM in tests.
- **Works at end:** `curl` a golden trace → record row appears within seconds.

## Phase 10: Extension ↔ server

- **Files:** `apps/extension/src/session/uploader.ts`, `src/privacy/redact.ts`,
  `entrypoints/background.ts` (pairing listener), `apps/web/src/routes/connect.tsx`.
- **Build:** pairing via `externally_connectable`; outbox with exponential
  backoff; capture-config polling (every 10 min + on popup open); redaction
  before upload; local op retention sweeper.
- **Tests:** redaction corpus (true positives + a false-positive corpus of
  normal code); uploader retry logic with fake clock; Playwright pairing flow.
- **Works at end:** solve on fake-leetcode → record appears in DB, no manual
  steps.

## Phase 11: Web app (V1 screens)

- **Files:** `apps/web/src/routes/{index,problems,problems.$id,sessions.$id,settings,connect,welcome}.tsx`,
  `src/components/record/{Header,Recall,Journey,Timeline,Solution,Mistakes,Drill,Claim}.tsx`,
  `src/api/client.ts` (Hono `hc`).
- **Build:** Home, History, Record (layered, with 👁/💭 styling and
  confirm/reject/edit), inline Timeline scrubber (revision code + diff +
  executions), Settings (skeleton).
- **Tests:** component tests for `Claim` states; Playwright: sign in → view
  record → reject a claim → regenerate → feedback persists.
- **Works at end:** the full loop on localhost.

## Phase 12: Privacy features

- **Build:** consent flow + versioning; global/extension pause sync; discard
  (local + server); exclude problem; export job (JSON + Markdown zip); delete
  account; retention cron; paired device management.
- **Tests:** delete account → assert **zero rows** for user across all tables
  (the test enumerates tables from the schema, so new tables can't be
  forgotten); export → re-import validates against schema; **canary test**:
  pipeline run with a canary string in code → assert logs/Sentry payloads
  don't contain it.
- **Works at end:** every control in [privacy §2](08-privacy-security.md#controls) works.

## Phase 13: Beta hardening and launch

- **Build:** Sentry (scrubbed) + PostHog (explicit events) + `render.yaml` +
  production Postgres + Web Store unlisted listing + privacy policy page +
  onboarding polish + claim-feedback dashboard (SQL view is fine).
- **Works at end:** 20 invited users can install and use Nue without you in
  the room.

## V1.5 phases (outline)

14. Review cards from records + FSRS scheduling + review UI.
15. Mistake profile (thresholded aggregation + evidence drill-down).
16. Pattern library.
17. Re-solve linking + time-to-insight deltas.
18. Obsidian folder sync, Anki export, Share-to-Notes.

---

## Testing strategy

### Pyramid, tailored to this system

```
                 ┌──────────────┐
                 │ Evals (LLM)  │  manual/nightly · golden set · rubric + labels · costs money
                 ├──────────────┤
                 │ E2E          │  Playwright · extension ↔ fake-leetcode ↔ API ↔ web
               ┌─┴──────────────┴─┐
               │ Integration      │  server modules against real Postgres · pipeline with FakeLlm
             ┌─┴──────────────────┴─┐
             │ Contract             │  LeetCode adapter vs recorded payloads · API DTOs · export schema
           ┌─┴──────────────────────┴─┐
           │ Unit + property + golden │  analysis (the bulk) · boundaries · validator · renderers
           └──────────────────────────┘
```

| Kind | What | Where | In CI? |
|---|---|---|---|
| **Unit** | Pure functions: compaction, boundaries, features, diff, segmentation, metrics, validator, renderers, redaction | `*.test.ts` next to code | ✅ |
| **Property** | `replay(compact(ops)) == final`; segmentation covers every revision exactly once; metrics non-negative & ≤ session length | `fast-check` in analysis | ✅ |
| **Golden** | Real traces + human labels → attempts, mistakes, metrics, rendered trace text snapshots | `fixtures/traces` | ✅ |
| **Contract** | `platform/leetcode.ts` against recorded network payloads + `__NEXT_DATA__` samples. When LeetCode changes, a new fixture reproduces it | `fixtures/leetcode` | ✅ |
| **Integration** | Server routes + services against real Postgres (`nue_test`), transaction rollback per test; pipeline with `FakeLlmClient` | `apps/server` | ✅ (Postgres service container) |
| **Security** | IDOR suite, delete-account completeness, log canary, manifest-permission guard | server + CI script | ✅ |
| **E2E** | Extension in Chrome (Playwright persistent context) on fake-leetcode → upload → record visible in web | `e2e/` | ✅ on `main` |
| **Evals** | Real LLM on golden set; schema-valid %, rejection %, taxonomy accuracy, rubric scores; compared to previous prompt version | `packages/pipeline/evals` | Manual + nightly (budget-capped) |
| **Live smoke** | A weekly manual checklist on real LeetCode (capture still works?) plus the extension's own health telemetry (hook success rate, no content) | checklist in `docs/` | — |

**Rules**
- Deterministic code gets exhaustive tests. It's cheap and it's the foundation.
- No test hits the real LLM or real LeetCode in CI.
- Every production bug in analysis becomes a golden fixture.
- Prompt changes require an eval run in the PR description.
