# 14 — Engineering Roadmap

**Status:** draft, 2026-10-04. Implements [13 — Product spec](13-product-spec.md).
It replaces the phase *order* in [11 — Build plan](11-build-plan.md). The phase
*contents* in doc 11 (files, interfaces, tests) still apply and are referenced
rather than repeated.

## Rules

1. **Every milestone ends with something you can run and show.** "Done" means
   a demo command or page plus green `pnpm check`. It never means "the code is
   written".
2. **Gates are binding.** Three milestones end in a go/no-go with criteria
   written in advance. A failed gate gets logged in
   [research/decisions](../research/decisions/DECISION-LOG.md) before anything
   else happens.
3. **The smallest slice first.** The order is chosen so that a *useful,
   private, offline* product (observed record plus cold re-solve) exists before
   any server. If the LLM stage disappoints, the work so far still stands.
4. **There is no milestone without tests.** Pure functions get unit and
   property tests, LeetCode parsing gets contract tests against fixtures, and
   nothing in CI calls a real LLM or LeetCode (CLAUDE.md).

## Overview

```
 M0  Validate + capture spike ─────────────── gate G0 (pain is real)
 M1  Contracts + fake-leetcode harness
 M2  Capture extension (real LeetCode → trace JSON)
 M3  Observed record, offline (in extension + CLI)
 M4  Cold re-solve + comparison + queue, offline
 M5  LLM inferences + V0 evaluation ───────── gate G1 (record is good)
 M6  Beta-0 server + invite-only classmates ─ gate G2 (people come back)
 M7  Public card
 M8  V1: accounts, web app, privacy completeness, Web Store
 M9  V1.5: mistake profile, more review kinds
```

The durations are rough estimates for one student working part-time. They
exist to expose scope creep, not to promise dates.

---

## M0 — Validate the pain and close the capture unknowns (≈1 week)

**Two tracks in parallel.**

| Track | Work | Output |
|---|---|---|
| Research | The Reddit pass, then 8 problem interviews with classmates ([VALIDATION-PLAN §2–3](../research/validation/VALIDATION-PLAN.md)) | `research/user-research/REDDIT-NOTES.md`, `research/user-research/interviews/*.md` |
| Engineering | The logged-in capture spike, exactly as in [12 §4](12-risks-and-first-task.md#4-exact-first-implementation-task) | `docs/spikes/002-run-submit-network.md`, scrubbed `fixtures/leetcode/network/*.json` |

- **Runnable:** the throwaway spike extension (branch `spike/capture`) dumps
  the event log for a real LeetCode session.
- **Spike addition for cold detection:** record what the editor loads when
  you revisit a solved problem (last code vs template), and the shape of
  the Reset action (`isFlush`), so §6.2 of the spec rests on observed
  behavior.
- **Gate G0:** ≥ 5 of 8 interviewees independently describe the pain *and* a
  workaround they've tried. If **3 or fewer**, stop and revisit the
  [TOP-5](../research/opportunities/TOP-5.md) choice.

## M1 — Contracts and the fake-LeetCode harness (≈4–5 days)

Doc 11, Phases 2 and 3, plus:

- `packages/contracts`: add `SessionComparison`, `StartKind`, `TraceGrade`,
  and `Sheet` schemas (spec §6, §10).
- `tools/fake-leetcode`: add a **"previously solved" mode** that preloads
  earlier code, and a Reset button that flushes to the template, so cold
  detection is testable offline.
- **Runnable:** `pnpm dev:fake` serves `localhost:5174/problems/two-sum/` with
  Monaco and mock Run/Submit that use the M0 fixture payloads.
- **Done when:** contract round-trip tests pass, fixtures parse, and the fake
  page shows the right network calls in DevTools.

## M2 — Capture extension (≈1.5 weeks)

Doc 11, Phase 4, unchanged in scope.

- **Runnable:** solve on **real** LeetCode with the unpacked extension. The
  popup lists the session, and **Export JSON** produces a trace that validates
  against `SessionTrace`.
- **Tests:** `compact` property tests, `decideBoundary` table tests, adapter
  contract tests against M0 fixtures, and Playwright on fake-leetcode (type,
  delete, run, submit, export, assert).
- **Done when:** 10 of the founder's real sessions export cleanly across
  Python plus one of Java/C++.

## M3 — Observed record, offline (≈1.5 weeks)

Doc 11, Phase 5, plus the **in-extension record page** (spec M-3).

- `packages/analysis`: features (tree-sitter, Python first), diff, segment,
  results, metrics, and **rule-based mistake detectors** for the first ~10 common DSA
  slips (off-by-one in loop bounds, sorted-copy index loss, missing empty-input
  guard, integer overflow in mid, insert-before-lookup, …). They are
  deterministic, each with table tests.
- Golden set: the founder's first 10 traces plus hand-written labels.
- `apps/extension`: a record page (`chrome-extension://…/record.html#<id>`)
  rendering attempts, runs, fix diffs, the never-run deleted approach, time to
  insight, and rule-detected mistakes. **No network.**
- CLI: `pnpm nue analyze --no-llm trace.json` prints the same content as
  Markdown.
- **Runnable:** solve a problem, then click the badge to open the observed
  record within seconds.
- **Done when:** segmentation precision and recall are reported against the
  golden labels (as numbers, not a pass/fail), and 100% of observed statements
  in 10 records are correct when checked by hand.

## M4 — Cold re-solve, comparison and queue, offline (≈1 week)

Spec §6.2, §6.3 and §6.5. All in `packages/analysis` and the extension.

- `classifyStart(session, priorSessions, templateHash) → StartKind`.
- `compareSessions(prev, next) → SessionComparison`.
- `gradeFromTrace(analyzed) → TraceGrade`, then `ts-fsrs` scheduling stored in
  IndexedDB.
- Extension: a **queue page** ("problems you may have lost"), a "Re-solve cold"
  button that opens the problem and reminds you to Reset, a comparison view
  on the record, and a sheet import (paste URLs).
- **Runnable:** re-solve a problem from a week ago and see the comparison
  ("insight 3m, was 11m; didn't repeat X").
- **Tests:** the fixtures from spec §15 (cold, warm, pasted-old-solution),
  property tests for `compareSessions`, and FSRS with a fake clock.
- **This is the first point where Nue is a usable product** for the founder,
  with no server and no LLM.

## M5 — LLM inferences and the V0 evaluation (≈2 weeks)

Doc 11, Phases 6 and 7.

- `packages/pipeline`: LLM client (Anthropic, behind the interface), stages,
  validator, and a `FakeLlmClient` for CI. `pnpm nue analyze trace.json`
  outputs the full record.
- `pnpm eval` runs against the golden set (manually, budget-capped).
- **Runnable:** the CLI turns a real trace into a full Markdown record with 💭
  claims, each citing evidence.
- **Gate G1 (the V0 gate):** the criteria in [03 — V0](03-mvp.md), plus a
  new one: comparisons in at least 5 real cold re-solves are judged accurate
  by the founder. **If the inferred-claims or blind-preference criteria fail
  after two prompt iterations, ship Beta-0 with the observed record only.**
  M3 and M4 stand on their own.

## M6 — Beta-0: minimal server and invite-only classmates (≈2 weeks build + 2 weeks test)

Doc 11, Phases 8–10, cut down per spec §9:

- `apps/server`: Hono, Postgres, Drizzle, and pg-boss. Modules `identity`
  (invites and device tokens only), `ingest`, `pipeline`, `records` and
  `privacy` (export and delete).
- Endpoints: `POST /v1/devices/redeem`, `POST /v1/sessions`,
  `GET /v1/sessions/:id/record` (private 128-bit URL plus token),
  `GET /v1/queue`, `DELETE /v1/sessions/:id`, and `DELETE /v1/device-data`.
- Extension: an uploader with an outbox and retry, redaction before upload, and
  the local record linking to the server record when inferences are ready.
- Deploy to Render with managed Postgres. Scrubbed Sentry. PostHog events from
  spec §14.
- **Runnable:** an invited classmate sideloads the extension, redeems a code,
  solves, and sees the observed record immediately and inferences within ~60
  seconds.
- **Tests:** idempotent upload, worker resume, an IDOR suite on every route, a
  delete-completeness test (every table, enumerated from the schema), and a
  log-canary test.
- **Gate G2 (2-week test, 10+ classmates):** **≥ 4 of 10 open a record
  unprompted in week 2**, and ≥ 1 cold re-solve per week-2 active user. If
  this fails, stop or pivot ([TOP-5 §1.15](../research/opportunities/TOP-5.md)).

## M7 — Public card (≈1 week)

Spec §6.4.

- `publish` module: `publication` table, `GET/PATCH /v1/publication`, and
  server-rendered `/p/:handle` plus a cached `/p/:handle/card.svg`.
- Plausibility checks exclude implausible sessions from card counts.
- **Runnable:** enable the card, paste one Markdown line into a GitHub README,
  and the card renders there.
- **Tests:** the card privacy test (schema-enumerated fields only, no code),
  an SVG snapshot, the forged-trace corpus, and immediate 404 when disabled.
- **Measure:** the share of Beta-0 actives who enable it, and installs
  attributed to card clicks.

## M8 — V1: accounts, web app, store listing (≈4–6 weeks)

Doc 11, Phases 11–13: Better Auth (GitHub and Google), migrating invite
devices to accounts, the web app (Home with queue, History, Record with
inline timeline, Sheet, Settings), the complete privacy controls from
[08](08-privacy-security.md), and the Chrome Web Store (unlisted, then public).

- **Runnable:** a stranger installs from the store and uses Nue without the
  founder present.
- **Success:** the V1 metrics in spec §17.

## M9 — V1.5 (outline)

The mistake profile with evidence thresholds, extra review kinds beyond the
cold re-solve (cue cards, blind recall), Obsidian and Anki export, and
re-solve trend charts. Order them by Beta-0 and V1 data, not by this list.

---

## Dependency graph

```
M0 ──► M1 ──► M2 ──► M3 ──► M4 ──► M5 ──► M6 ──► M7 ──► M8 ──► M9
 │                                  ▲       ▲
 └─ G0 (research track) ────────────┘       │
                          G1 failure path: skip inferences, still ship M6
```

## What the founder should be able to explain, per milestone

The research flagged a portfolio risk: AI co-authored work that the author
can't defend ([FOUNDER-AND-REPO-PROFILE §3](../research/problem-discovery/FOUNDER-AND-REPO-PROFILE.md)).
Before closing each milestone, the founder should be able to answer these
without notes:

| Milestone | Questions |
|---|---|
| M2 | Why a MAIN-world script plus an isolated relay? What happens when the MV3 service worker is killed mid-session? |
| M3 | How does segmentation decide a boundary? What are its precision and recall, and on what labels? |
| M4 | How is "cold" detected, and how could it be fooled? Why no self-rating? |
| M5 | How does the validator reject a hallucinated claim? Show a rejected example. |
| M6 | What makes upload idempotent? How do you know account deletion leaves zero rows? |
| M7 | What can a forged trace do to the card, and what stops it? |
