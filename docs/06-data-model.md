# 06 — Data Model

Covers design-doc section **10 (Data model)**.

---

## 1. Storage tiers: what we keep and what we discard

The guiding question: *what do we need to regenerate a record with a better
pipeline in a year?* Answer: Layer 1 at **revision** granularity, not
**operation** granularity. Everything above Layer 1 is regenerable.

| Tier | Data | Where | Retention | Why |
|---|---|---|---|---|
| **Ops** (Tier 2) | Monaco operations | Extension IndexedDB only (default). Server only if user opts in | 7 days on device after session upload, then deleted. Server copy (opt-in): 30 days | Lossless but bulky and the most sensitive. Only needed to recompute revisions |
| **Trace** (Tier 0+1+context) | revisions (full code), checkpoints, execution results, context events | Server | **Kept** for the life of the account (user can delete any session) | Source of truth for regeneration. Small: ~50–300 KB/session |
| **Derived facts** (Layer 2) | attempts, features, diffs, fix-diffs, timings | Server (`stage_runs` outputs + a few indexed tables) | Kept; recomputable | Needed for fast queries (time-to-insight, mistakes) |
| **Inferences** (Layer 3) | claims + evidence + user feedback | Server | Kept; latest 2 pipeline versions | User feedback is irreplaceable ground truth |
| **Records** (Layer 4) | learning record documents | Server | Latest version + previous version | Regenerable |
| **Aggregates** | concept stats, mistake occurrences, review cards | Server | Kept; recomputable (except review history) | Review history is irreplaceable |
| **Never stored** | keystrokes, cursor/selection, problem statement text, cookies/headers, other URLs, screen content | — | — | Not needed / not ours / not allowed |

---

## 2. Entity map

```
user ─┬─< device
      ├─< session >── problem ──< problem_profile (versioned, shared)
      │      ├─< revision
      │      ├─< execution  (checkpoint + result; references revision)
      │      ├─< context_event
      │      ├─< attempt ──< (revision range)
      │      ├─< pipeline_run ──< stage_run
      │      └─< learning_record (versioned)
      │             └─< claim ──< claim_evidence
      │                   └── claim_feedback (1:1, user verdict)
      ├─< mistake_occurrence >── mistake_category (taxonomy)
      ├─< concept_evidence  >── concept (taxonomy) >──< pattern (taxonomy)
      ├─< review_card ──< review_log               (V1.5)
      └── user_settings

taxonomy (versioned, in repo, seeded to DB): pattern, concept, mistake_category, approach
```

### Mapping to the brief's entities

| Brief entity | Our design | Note |
|---|---|---|
| User | `user` | |
| Problem | `problem` (global, per platform+slug) + `problem_profile` | Problems are shared across users. Profiles are AI-generated, versioned |
| Session | `session` | One sitting on one problem |
| CodeSnapshot | `revision` | Full code text at a coalesced point |
| CodeChange | **not a table.** Ops live on device. Diffs are computed | Storing diffs duplicates revisions |
| Execution | `execution` | Run or submit, with result |
| Error | columns on `execution` (`verdict`, `error_kind`, `error_message`, `failing_input`…) | 1:1 with execution; a separate table adds joins for nothing |
| Attempt | `attempt` | Segment of revisions with a coherent approach |
| ReasoningEvent / Insight | `claim` (typed: `insight`, `turning_point`, `misconception`…) | One table, typed. Every inference has the same shape (text, confidence, evidence) |
| LearningRecord | `learning_record` (JSONB document, versioned) | Document-shaped, read as a whole |
| Concept / Pattern | `concept`, `pattern` (taxonomy) | Closed sets, versioned in repo |
| Review | `review_card`, `review_log` (V1.5) | FSRS state per card |
| InterviewQuestion | inside `learning_record.drill` (V1); `review_card` of type `interview` (V1.5) | Not a separate entity until interview mode |
| UserWeakness / UserStrength | **derived views**, not tables: `mistake_occurrence` + `concept_evidence` aggregated with thresholds | Storing "weakness" as a row invites stale, unevidenced claims |

---

## 3. Schema (V1)

PostgreSQL. `id` columns are UUIDv7 (time-ordered: good index locality,
sortable). All user-owned tables have `user_id` with `ON DELETE CASCADE` from
`user`, which is what makes account deletion one statement. Timestamps are
`timestamptz`.

```sql
-- ── identity ─────────────────────────────────────────────────────────────
user            (id, email UNIQUE, name, created_at, deleted_at NULL)
                 -- Better Auth also creates: account, auth_session, verification
device          (id, user_id → user, label, token_hash UNIQUE, scopes text[],
                 extension_version, created_at, last_seen_at, revoked_at NULL)
user_settings   (user_id PK → user,
                 capture_enabled bool DEFAULT true,
                 upload_ops bool DEFAULT false,
                 raw_retention_days int DEFAULT 7,
                 ai_processing_enabled bool DEFAULT true,
                 excluded_problem_slugs text[] DEFAULT '{}',
                 consent_version text, consent_at timestamptz)

-- ── problems (global) ────────────────────────────────────────────────────
problem         (id, platform text CHECK ('leetcode'), slug, frontend_id text,
                 title, difficulty text, platform_tags text[],
                 UNIQUE(platform, slug))
problem_profile (id, problem_id → problem, version int, profile jsonb,
                 source text CHECK ('generated','reviewed'), model text,
                 prompt_version text, created_at, UNIQUE(problem_id, version))

-- ── capture (Layer 1) ────────────────────────────────────────────────────
session         (id, user_id, problem_id, device_id,
                 client_session_id text,          -- idempotency, from extension
                 language text, started_at, ended_at,
                 end_reason text,                  -- accepted_idle | inactive | navigated | manual
                 outcome text,                     -- accepted | attempted | abandoned
                 active_ms int, capture_version text,
                 signal_tiers text[],              -- {'t0','t1'} or {'t0','t1','t2'}
                 degraded bool,                    -- e.g. Monaco hook failed
                 status text,                      -- received | processing | ready | failed
                 UNIQUE(user_id, client_session_id))
revision        (id, session_id, seq int, t_ms int,  -- ms since session start (monotonic)
                 source text,                      -- pause | jump | checkpoint | blur | flush | poll
                 code text, code_sha256 bytea,
                 lines_added int, lines_removed int, is_paste bool,
                 UNIQUE(session_id, seq))
execution       (id, session_id, revision_id → revision, seq int, t_ms int,
                 kind text,                        -- run | submit
                 verdict text,                     -- accepted | wrong_answer | runtime_error | compile_error | tle | mle | output_limit | other
                 error_kind text NULL,             -- e.g. IndexError, NullPointerException
                 error_message text NULL,          -- truncated to 2 KB
                 error_line int NULL,
                 failing_input text NULL, expected_output text NULL, actual_output text NULL,  -- each truncated
                 passed_cases int NULL, total_cases int NULL,
                 runtime_ms int NULL, memory_kb int NULL,
                 is_custom_input bool)
context_event   (id, session_id, t_ms int,
                 kind text,  -- tab_hidden | tab_visible | editor_blur | editor_focus | viewed_description
                             -- | viewed_hints | viewed_editorial | viewed_solutions | viewed_submissions
                             -- | reset | language_changed | code_loaded | paused | resumed
                 data jsonb)
session_ops     (session_id PK → session, ops bytea, -- compressed, opt-in only
                 expires_at timestamptz)

-- ── pipeline bookkeeping ─────────────────────────────────────────────────
pipeline_run    (id, session_id, pipeline_version text, status text,
                 started_at, finished_at, error text NULL,
                 total_input_tokens int, total_output_tokens int, cost_usd numeric(10,5))
stage_run       (id, pipeline_run_id, stage text, status text, started_at, finished_at,
                 model text NULL, prompt_version text NULL,
                 input_tokens int, output_tokens int, output jsonb,  -- persisted for resume + debugging
                 validation_errors jsonb NULL)

-- ── derived facts (Layer 2), indexed subset ──────────────────────────────
attempt         (id, session_id, pipeline_run_id, seq int,
                 first_revision_seq int, last_revision_seq int,
                 start_ms int, end_ms int, approach_id text NULL,  -- taxonomy
                 features jsonb, boundary_reason text,
                 executions int, outcome text)     -- never_run | failed | accepted
session_metrics (session_id PK, pipeline_run_id,
                 time_to_first_run_ms int, time_to_insight_ms int NULL,
                 attempts int, runs int, submits int, failed_runs int,
                 pasted_lines int, viewed_editorial bool, viewed_hints bool)

-- ── inferences + records (Layers 3–4) ────────────────────────────────────
learning_record (id, session_id, user_id, version int, pipeline_run_id,
                 document jsonb,                    -- see notes schema
                 created_at, is_current bool,
                 UNIQUE(session_id, version))
claim           (id, record_id → learning_record, user_id, type text, text,
                 confidence text, alternatives text[], taxonomy jsonb,
                 stable_key text)                   -- carries feedback across regenerations
claim_evidence  (claim_id, ref_kind text, ref_id uuid, quote text NULL)
claim_feedback  (id, user_id, session_id, stable_key text,
                 verdict text,                      -- confirmed | rejected | edited
                 edited_text text NULL, created_at,
                 UNIQUE(user_id, session_id, stable_key))

-- ── memory (aggregation) ─────────────────────────────────────────────────
mistake_occurrence (id, user_id, session_id, category_id text, claim_id NULL,
                    source text,                   -- rule | llm | user
                    t_ms int, created_at)
concept_evidence   (id, user_id, session_id, concept_id text,
                    kind text,                     -- demonstrated | struggled | assisted
                    claim_id NULL, created_at)

-- ── V1.5 ─────────────────────────────────────────────────────────────────
review_card     (id, user_id, session_id NULL, problem_id NULL, pattern_id NULL,
                 kind text,  -- cue | blind_recall | mistake | complexity | interview
                 prompt jsonb, answer_ref jsonb,
                 fsrs_state jsonb, due_at timestamptz, suspended bool)
review_log      (id, card_id, user_id, reviewed_at, rating smallint, elapsed_ms int,
                 user_answer text NULL)
```

### Indexes worth having from day one

- `session (user_id, started_at DESC)`: home, history
- `session (user_id, problem_id)`: problem page, re-solves
- `revision (session_id, seq)`, `execution (session_id, seq)`: unique constraints double as indexes
- `mistake_occurrence (user_id, category_id, created_at)`: mistake profile
- `learning_record (session_id) WHERE is_current`
- `review_card (user_id, due_at) WHERE NOT suspended`

### Why a JSONB document for the record?

The record is *read as a whole*, *written as a whole* by the pipeline, and its
shape will evolve quickly (prompt iterations). A document column with a
`schemaVersion` field plus a zod schema in `@nue/contracts` gives flexibility
without migrations for every note-field tweak. Things we **query across
records** (claims, mistakes, concepts, metrics) are **normalized into tables**.
Rule of thumb: *if you'll `WHERE`/`GROUP BY` it across sessions, it's a column.*

### Why `stable_key` on claims?

Regeneration produces new claim rows. User feedback must survive. `stable_key`
= `type + primary evidence ref` (e.g. `abandon_reason:A1`), so a regenerated
"why you abandoned attempt 1" claim picks up the prior verdict and edited text.

---

## 4. Taxonomy (versioned data in the repo)

`packages/contracts/taxonomy/*.json`, reviewed like code. Seeded into Postgres
by migration. Small and opinionated to start:

- **Patterns (~25):** hash_lookup, frequency_count, two_pointers, sliding_window,
  prefix_sum, binary_search_index, binary_search_answer, monotonic_stack,
  heap_top_k, intervals_sort_sweep, bfs_grid, bfs_graph, dfs_backtracking,
  tree_dfs, tree_bfs, topological_sort, union_find, dp_1d, dp_2d, dp_knapsack,
  dp_interval, greedy, trie, linked_list_pointers, bit_manipulation, math.
- **Concepts (~40):** finer-grained building blocks (complement_lookup,
  invariant_maintenance, loop_bounds, visited_set, memoization, …), each with a
  deterministic **detector** where possible (e.g., `visited_set` ⇐ set
  membership check inside a BFS/DFS loop).
- **Mistake categories (~25):** grouped as `conceptual.*`, `implementation.*`,
  `edge_case.*`, `complexity.*`, `language.*`, `process.*` (e.g.,
  `process.coded_before_planning`: large rewrites without runs).
- **Approaches (~15):** brute_force, sort_first, hash_lookup, two_pointers,
  recursion, dp, greedy, math, simulation, …

Adding an ID is cheap. Renaming/merging is a migration with a mapping. That's
the point: a stable vocabulary is what makes cross-session aggregation mean
anything.

---

## 5. Extension-side storage (IndexedDB)

```
sessions   { clientSessionId, problemSlug, language, startedAt, endedAt?, status: recording|finalized|uploaded|discarded }
ops        { clientSessionId, seq, t, versionId, changes[], isUndo, isRedo, isFlush }   (deleted N days after upload)
revisions  { clientSessionId, seq, t, source, code, … }
executions { clientSessionId, seq, t, … }
context    { clientSessionId, seq, t, kind, data }
outbox     { clientSessionId, attempts, nextAttemptAt, lastError }
```

The extension's data is plain IndexedDB (not encrypted at rest; same as every
extension). The threat model explains why that's acceptable.
