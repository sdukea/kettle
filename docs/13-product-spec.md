# 13 — Product Specification (post-research)

**Status:** draft, written 2026-10-04 after the founder chose Opportunity 1
([research/decisions D7](../research/decisions/DECISION-LOG.md)).

This spec **updates** docs 02–12 with what the research found. Where it
conflicts with [03 — MVP](03-mvp.md) or [11 — Build plan](11-build-plan.md),
this document wins. It does not repeat the parts of the design that still
stand (capture tiers, pipeline layers, privacy model). It links to them.

## What changed, and why

| Change | Before | Now | Evidence |
|---|---|---|---|
| **Target user** | Generic interview preppers | Placement-season CS students in Bangalore working through a fixed DSA sheet | Reachability; placement season as forcing function [S34, S35] |
| **Primary review action** | Read the record; review cards in V1.5 | **Cold re-solve** of your own past problem, compared trace-to-trace | Retrieval beats re-reading [S06]; self-ratings are unreliable [S02] |
| **Re-solve comparison** | V2 feature "N" | **Core loop, before any server** | It is the "evidence of growth" that breaks the avoidance loop ([PSYCHOLOGY §1](../research/psychology/PSYCHOLOGY.md)) |
| **Adoption mechanism** | None explicit | **Opt-in public card of observed process facts** ("honest LeetHub") | Visibility tools have ~100× the installs of retention tools [S26, S28] |
| **Problem universe** | Whatever you solve | Your sheet, imported as a list of LeetCode URLs | Students already trust a sheet [S34] |
| **First record location** | CLI (V0), then web (V1) | CLI, **plus an observed-only record inside the extension**, before any server | `packages/analysis` is already isomorphic, so facts need no server |

Source IDs (`S..`) refer to [research/SOURCES.md](../research/SOURCES.md).

---

## 1. Target user

**Primary (the first 100):** third-year B.Tech/BE CSE students in Bangalore,
August–March of their placement year, who:

- follow a fixed sheet (Striver A2Z, NeetCode 150, or one their seniors
  passed down),
- solve on leetcode.com, 10 or more problems a week,
- have an online assessment or interview in the next ~8 weeks.

**Builder-as-user:** the founder is in this population, which is why V0 can be
judged first-hand.

**Not targeted yet:** working engineers changing jobs, competitive programmers,
and other platforms (GeeksforGeeks, HackerRank OAs). The adapter keeps these
open for later.

## 2. Core job to be done

> *When I'm grinding my sheet before placements, help me **keep** what I've
> solved and **see** that I'm actually getting better, so I walk into the
> OA or interview knowing what I can do, not hoping.*

Sub-jobs, in priority order:

1. Tell me what I got wrong *in my own process*, without me writing notes.
2. Tell me which solved problems I've actually lost, and prove it by letting me
   re-solve them cold.
3. Show me, in numbers I trust, that my re-solves are getting faster and
   cleaner.
4. Let me show that honestly to others (peers, seniors, recruiters) if I choose.

## 3. User journey

```
Day 0   Install extension → consent (5 bullets) → paste sheet URLs (optional)
        → "Solve anything on your sheet. Nue is recording only this tab."

Day 0   Solve "3Sum" on LeetCode. Badge ● while recording.
        Accepted → session ends on idle → badge ✓.
        Click badge → "Your record is ready" → observed record opens (local):
          attempts, failed runs and what fixed them, time to insight,
          "never-run" deleted approach.

Day 1+  (once the LLM stage is on) the record gains 💭 inferences, each with
        evidence and confirm/reject.

Day 3   After ~5 sessions: "Recurring: you return indices from a sorted copy
        (2 problems)."   ← the magic moment (§7)

Day 10  Home shows "3 problems you may have lost" (scheduled from trace facts,
        not self-rating). Click "Re-solve cold" → LeetCode opens with the
        default template → solve → comparison:
          "Insight at 3m (was 11m). Didn't repeat the sorted-index mistake.
           Went straight to two pointers."

Day 14  Optional: enable public card → paste one Markdown line into GitHub
        README → card shows observed facts (see §6.4).

Placement week   Home: sheet coverage × retention: "A2Z steps 1–9: 112 solved,
                 31 re-solved cold, 6 lost."
```

## 4. MVP (what V0 + Beta-0 must do)

The MVP answers the [V0 question](03-mvp.md#v0--is-the-record-any-good-you-34-weeks)
*and* the adoption question (§11). It is defined by capability, not by screen:

| # | Capability | Notes |
|---|---|---|
| M-1 | Capture Tier 0 + Tier 1 + context on leetcode.com/problems/* | As designed in [01](01-capture.md). No change |
| M-2 | Session boundaries, pause, discard, local storage | As designed |
| M-3 | **Observed-only record in the extension** | Rendered from `packages/analysis`. No network |
| M-4 | LLM inference stage with deterministic validation | As in [05](05-ai-pipeline.md). CLI in V0, server in Beta-0 |
| M-5 | **Cold re-solve detection and trace comparison** | §6.2 |
| M-6 | **Re-solve queue** scheduled from trace-derived grades | §6.3 |
| M-7 | Sheet import (paste a list of LeetCode URLs) | §6.5 |
| M-8 | Beta-0 server: invite-token devices, ingest, worker, private record pages | Minimal. No full accounts yet (§9) |
| M-9 | Export and delete everything | Non-negotiable even in beta |

## 5. Not in the MVP

| Deferred | Until | Why |
|---|---|---|
| Public card (§6.4) | After Beta-0 shows people read records | Visibility only matters if the content is worth showing |
| Full accounts (Better Auth, OAuth), web Home/History | V1 | 10–30 invited users don't need them |
| Mistake profile UI with thresholds | V1.5 | Needs volume. Data is collected from day one |
| FSRS review cards (non-re-solve card types) | V1.5 | Cold re-solve covers retrieval first |
| Other platforms, Firefox/Safari | V2 | |
| Any help while solving | **Never** | Non-negotiable |
| Readiness score, leaderboards, streaks | **Never** | [02 §1](02-product.md#what-nue-is-not) |
| Redistributing third-party sheets | Until permission is granted | Curated lists are someone's work. Users paste their own |

## 6. Core features in detail

### 6.1 The record

As specified in [07](07-learning-record.md), with one change: the **observed
layer must stand alone**. With the LLM off, the record still shows attempts,
runs with verdicts, fix diffs, the deleted never-run approach, time to first
run, time to insight, and editorial or paste flags. That is the M-3 record.

### 6.2 Cold re-solve and comparison

A **re-solve** is any session on a problem slug where the user already has a
session. It is **cold** when:

- the editor's starting code equals the platform's default template, or the
  user hits Reset in the first 30 s (detected via `isFlush` plus a template
  hash), **and**
- no revision in the first 60 s shares more than a threshold of structural
  fingerprint with the user's previous accepted code (catching "pasted my old
  solution back").

Otherwise it is **warm**. Warm re-solves are shown but excluded from growth
metrics.

**Comparison output** (pure function in `packages/analysis`):

```ts
compareSessions(prev: AnalyzedSession, next: AnalyzedSession): SessionComparison
type SessionComparison = {
  cold: boolean;
  timeToInsightDeltaMs: number | null;   // negative = faster
  firstApproachSame: boolean;            // went straight to the final approach?
  repeatedMistakes: MistakeCategoryId[]; // same category in both
  avoidedMistakes: MistakeCategoryId[];  // in prev, absent in next
  failedRunsDelta: number;
  assistanceDelta: { editorial: [boolean, boolean]; pastedLines: [number, number] };
};
```

All fields are computed facts. The LLM may *phrase* the summary, but every
number comes from this function.

### 6.3 Re-solve queue (no self-rating)

Each accepted session produces a **grade derived from the trace**, not from
the user:

| Grade | Rule (initial, tunable) |
|---|---|
| Again | Not accepted, or editorial/solutions viewed, or ≥ N pasted lines |
| Hard | Accepted, but ≥ 3 failed runs or time to insight > 2× the user's median for that difficulty |
| Good | Accepted with ≤ 2 failed runs |
| Easy | Cold re-solve, first approach equals final, no failed runs |

The grades feed FSRS (`ts-fsrs`) per (user, problem). The queue shows the
problems due, capped per day. **Why:** self-rated confidence is least
reliable for exactly the users who need the signal most [S02].

### 6.4 Public card (after Beta-0)

An opt-in, per-user public page `nue.app/p/:handle`, plus an SVG card for
GitHub READMEs. It shows **observed facts only**:

- problems solved, and how many were solved *without editorial and without
  large pastes*,
- cold re-solves done, and the median time-to-insight change on re-solves,
- sheet coverage (if imported).

It **never** shows code by default (per-problem opt-in only), inferred
claims, or mistakes.

**Honesty clause:** the card says "observed by Nue", not "verified". A
modified client could fake events. The threat model in [08 §5](08-privacy-security.md#5-threat-model)
gains an entry for this (forged traces → misleading card), mitigated by
plausibility checks (impossible typing rates, timestamp monotonicity, code
that appears without revisions) and by never using the word "verified".

### 6.5 Sheet import

The user pastes LeetCode problem URLs, or their LeetCode favourites list
URL. Nue stores `(user, sheet_name, ordered slugs)` and nothing else: no
problem text (non-negotiable) and no third-party sheet content. Coverage
equals the share of slugs with an accepted session. Retention equals the share
whose last cold re-solve graded Good or Easy.

## 7. The magic moment

The first time Nue names a mistake **the user didn't know they repeat**, drawn
from **their own deleted or failing code**, with links to both sessions:

> ⚠ You returned indices from a sorted copy of the input, in **Two Sum** (3 days
> ago) and **3Sum Closest** (today). Both failed on the first unsorted test.

The second moment, which is the retention driver, is the first cold re-solve
comparison that shows growth: *"insight at 3m, was 11m."*

**Design constraint:** both must happen within the first week of normal
usage (~10–15 sessions). That requires a mistake taxonomy that catches common
DSA slips deterministically where possible. Rule-based detection runs before
the LLM ([05 §2](05-ai-pipeline.md#2-the-pipeline)).

## 8. Retention loop

```
 solve (sheet) ──► record (facts now, inferences soon)
      ▲                         │
      │                         ▼
 re-solve queue ◄── trace-derived grade → FSRS
      │
      ▼
 cold re-solve ──► comparison = evidence of growth ──► (opt-in) public card
                                                            │
                                    peers see card ─────────┘  (acquisition)
```

- **The internal trigger** is the fear of losing what was solved before
  placement week. The queue answers "what have I lost?".
- **The reward** is growth evidence against yourself, not against peers.
- **Investment:** every session improves your mistake history and queue.
- **Acquisition:** the card, in the same channel LeetHub proved works [S28].

## 9. Technical architecture

The architecture in [04](04-architecture.md) stands. Changes:

```
┌──────────────── Chrome extension (WXT, MV3) ────────────────────┐
│ MAIN-world probe ──► relay ──► background SW ──► IndexedDB      │
│                                     │                           │
│                       packages/analysis (isomorphic)            │
│                     compact · features · segment · metrics      │
│                     · rule mistakes · compareSessions           │
│                                     │                           │
│                     extension page: observed record + queue     │  ← NEW (M-3, M-5, M-6 local)
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS, device token (Beta-0: invite token)
┌──────────────────────────────▼──────────────────────────────────┐
│ apps/server (Hono)  modules: identity · ingest · pipeline ·     │
│                     records · memory · privacy · publish (NEW)   │
│ worker (pg-boss) ──► packages/pipeline (LLM stages + validator) │
│ Postgres                                                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│ apps/web (React SPA): record · queue · sheet · settings         │
│ public: /p/:handle, /p/:handle/card.svg (server-rendered)       │
└─────────────────────────────────────────────────────────────────┘
```

**Key decision: facts locally, inferences on the server.** The extension can
show a useful, private, observed-only record with zero network. The server
adds LLM inferences, sync across devices, and the public card. If the LLM
stage proves weak in V0, the product degrades to the observed record plus
cold re-solves, which is still a product.

**Beta-0 simplification:** no Better Auth. The founder issues invite
codes. The extension exchanges a code for a device token (`POST
/v1/devices/redeem`), and records are readable at unguessable private URLs
(128-bit) behind that token. The full identity module arrives in V1, and
device tokens migrate to user accounts.

## 10. Data model changes

Additions to [06 §3](06-data-model.md#3-schema-v1). Existing tables are
unchanged.

```sql
-- re-solves
session            + resolve_of_session_id uuid NULL → session   -- previous session on same problem
                   + start_kind text  -- fresh | cold_resolve | warm_resolve
session_comparison (session_id PK → session, prev_session_id → session,
                    pipeline_run_id, comparison jsonb)          -- output of compareSessions, cached

-- scheduling (replaces V1.5 review_card for the re-solve kind)
problem_schedule   (user_id, problem_id, fsrs_state jsonb, due_at timestamptz,
                    last_grade text, last_session_id → session,
                    PRIMARY KEY (user_id, problem_id))

-- sheets
sheet              (id, user_id, name, created_at)
sheet_item         (sheet_id → sheet, position int, problem_id → problem,
                    PRIMARY KEY (sheet_id, position))

-- publishing (after Beta-0)
publication        (user_id PK → user, handle text UNIQUE, enabled bool,
                    fields text[],               -- which observed facts to show
                    created_at, updated_at)

-- Beta-0 only
invite             (code_hash bytea PK, created_by text, redeemed_device_id NULL,
                    created_at, expires_at)
```

Extension IndexedDB gains `comparisons`, `schedule` and `sheets` stores
mirroring the above, so M-3, M-5 and M-6 work offline.

## 11. APIs

Additions to [04 §4](04-architecture.md#4-api-boundaries):

| Method | Path | Client | Purpose |
|---|---|---|---|
| `POST` | `/v1/devices/redeem` | Extension | Beta-0: invite code → device token |
| `DELETE` | `/v1/device-data` | Extension | Beta-0: delete everything uploaded by this device (no accounts yet) |
| `GET` | `/v1/queue` | Web / extension | Due re-solves (from `problem_schedule`) |
| `GET` | `/v1/sessions/:id/comparison` | Web | `SessionComparison` + prior session ref |
| `GET/PUT` | `/v1/sheets[/:id]` | Web / extension | Sheet CRUD (slugs only) |
| `GET/PATCH` | `/v1/publication` | Web | Enable, handle, choose fields |
| `GET` | `/p/:handle` · `/p/:handle/card.svg` | Public | Server-rendered, cached, no auth, observed facts only |

All request and response types live in `packages/contracts`. Public endpoints
are rate-limited and return only the fields listed in `publication.fields`.

## 12. Infrastructure

Unchanged from [04 §3](04-architecture.md#deployment-one-paas-render-postgres-managed):
one PaaS (Render), managed Postgres, a web service plus a worker service, and
static web assets. Beta-0 runs on the smallest tiers. The expected load is
fewer than 50 users and fewer than 2,000 sessions a month. **Estimated
cost:** low tens of USD a month plus LLM spend at ≤ $0.10 per session
([05 cost envelope](05-ai-pipeline.md#cost-envelope-to-verify-in-v0)). Verify
in V0.

## 13. Security and privacy

Everything in [08](08-privacy-security.md) stands. New items:

| Item | Requirement |
|---|---|
| Public card | Off by default. Observed facts only. No code unless opted in per problem. Handles are revocable. Turning it off returns 404 immediately (card cache ≤ 5 min) |
| Card integrity | Say "observed", never "verified". Plausibility checks flag implausible traces, which are excluded from card counts |
| Invite tokens (Beta-0) | Hashed at rest, single-use, expire after 14 days. Device tokens follow the existing rules |
| Re-solve detection | Uses hashes of the user's *own* previous code only. Never fetches other users' code |
| Sheets | Slugs only. No problem text, no third-party sheet content |
| Students' data | Users are adults (university), but expect DPDP Act 2023 obligations in India: purpose limitation, consent, erasure. Export and delete already cover access and erasure |

## 14. Observability

Per [04 §3 Observability](04-architecture.md#observability), with
content-free logging (CLAUDE.md non-negotiable: log IDs, never code or
prompts). Product events (PostHog, explicit, no autocapture):

`session_captured`, `record_opened{layer}`, `claim_feedback{verdict}`,
`resolve_started{kind}`, `resolve_completed{kind,grade}`,
`queue_viewed{due}`, `sheet_imported{size}`, `publication_enabled`,
`card_viewed` (server-side count only).

System metrics: capture hook success rate (by adapter version), pipeline
success rate and p50/p95 latency, LLM cost per session, validation rejection
rate, and cold-detection outcomes (fresh, cold or warm), to tune thresholds.

## 15. Testing strategy

Per [11 — Testing strategy](11-build-plan.md#testing-strategy). Added
coverage:

| Unit | Tests |
|---|---|
| `compareSessions` | Table tests over golden session pairs. Property: comparing a session with itself gives zero deltas and `firstApproachSame` |
| Cold detection | Fixtures: reset-to-template, loaded-previous-code, pasted-old-solution, genuinely fresh |
| Trace-derived grade | Table tests for every rule boundary |
| FSRS integration | A deterministic clock. Due dates move forward on Good/Easy and backward on Again |
| Public card | Snapshot of the SVG. A **privacy test** asserting that no field outside `publication.fields` and no code ever appears, enumerated from the response schema |
| Plausibility checks | Synthetic forged traces (instant 200-line insertions without paste flags, non-monotonic timestamps) |

## 16. Deployment architecture

- **Extension:** unpacked for V0 and Beta-0 (sideloaded by invitees), then the
  Chrome Web Store as *unlisted*, then public at V1. Version pinning via
  `capture_version` on every session.
- **Server and worker:** Render services deployed from `main` on green CI.
  Migrations run in a pre-deploy step (Drizzle).
- **Environments:** local (fake-leetcode + local Postgres) and production.
  No staging until there are paying users. Every bug gets a fake-leetcode or
  golden fixture instead.
- **Rollback:** previous Render deploy. Migrations are additive-only during
  beta.

## 17. Success metrics

| Stage | Metric | Target | Source |
|---|---|---|---|
| V0 (founder) | Observed claims correct | 100% | [03](03-mvp.md#v0--is-the-record-any-good-you-34-weeks) |
| V0 | Inferred claims rated correct or close | ≥ 80% | 03 |
| V0 | Blind preference over own notes | ≥ 14/20 | 03 |
| Beta-0 (10–30 classmates) | **Opened a record unprompted in week 2** | **≥ 4 of 10** | Kill criterion ([TOP-5 §1.15](../research/opportunities/TOP-5.md)) |
| Beta-0 | Did ≥ 1 cold re-solve by day 14 | ≥ 50% of week-2 actives | New |
| Beta-0 | Faster time to insight on cold re-solves vs the first solve | ≥ 60% of re-solves | Outcome claim |
| After Beta-0 | Enabled the public card | ≥ 20% of actives | Visibility lever |
| V1 | Week-3 retention of week-1 actives | ≥ 60% | 03 |

**North-star (inference, to revisit):** *cold re-solves completed per active
user per week.* It captures both engagement and the learning act.

## 18. Validation strategy

The build is gated by validation. Neither replaces the other:

1. **Before code (parallel with the capture spike):** the Reddit pass and 8
   problem interviews with classmates ([VALIDATION-PLAN §2–3](../research/validation/VALIDATION-PLAN.md)).
   **If fewer than 3 of 8 describe the pain and a workaround, stop.**
2. **The V0 gate (founder, 20–30 sessions):** as in [03](03-mvp.md). If the
   record isn't preferred, rethink before building any server.
3. **The Beta-0 gate (10 classmates, 2 weeks):** the kill criteria in §17. If
   fewer than 4 of 10 open a record unprompted in week 2 and nobody attempts a
   cold re-solve, stop or pivot, and record the result in the decision log.
