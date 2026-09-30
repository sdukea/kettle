# 05 — AI Architecture and Pipeline

Covers design-doc section **9 (AI pipeline)** and the AI architecture brief:
separating raw observations → normalized events → inferred reasoning →
user-facing notes, and never blindly trusting the model.

---

## 1. Four layers, four trust levels

```
LAYER 1  RAW OBSERVATIONS       what the extension recorded            trust: exact
         ops, revisions, checkpoints, execution results, context events
            │  deterministic code only
            ▼
LAYER 2  OBSERVED FACTS         normalized, derived, still certain      trust: certain (derived)
         attempts (segments), structural features, diffs, fix-diffs,
         error categories, timings, time-to-insight, pastes, editorial views
            │  LLM, constrained by evidence
            ▼
LAYER 3  INFERENCES (CLAIMS)    what the facts probably mean            trust: probabilistic
         "abandoned brute force because it anticipated O(n²)"   conf 0.6
         every claim cites Layer 1/2 evidence IDs; validated deterministically
            │  LLM synthesis + deterministic rendering
            ▼
LAYER 4  LEARNING RECORD        the note the user reads                 trust: mixed, labeled
         every sentence is either rendered from a fact (👁) or is a claim (💭)
```

**The rule that makes this work:** *the LLM never produces a fact.* Anything
that can be computed ("you ran 4 times", "you deleted 11 lines at 04:10", "the
wrong answer was on `[3,2,4]`") is computed by code and rendered by templates.
The LLM only produces **interpretations**, and each one must point at the
evidence it interprets.

### Worked example

```
L1  revision r3 @02:14  (code contains `for i in range(len(nums)):\n  for j in range(i+1, len(nums)):`)
    revision r4 @04:10  (both loops deleted; 11 lines removed in one op)
    revision r5 @04:25  (`nums.sort()` + `lo, hi = 0, len(nums)-1`)
    checkpoint c1 @07:02 → result: Wrong Answer, input [3,2,4] 6, expected [1,2], got [0,1]
    revision r9 @07:05  (`seen = {}`)

L2  attempt A1 [r1..r3] features {nested_loop_same_array, no_aux_ds}  label: brute_force   never run
    attempt A2 [r5..r8] features {sorts_input, two_index_pointers}     label: two_pointers  1 run, WA
    attempt A3 [r9..r14] features {dict_lookup, single_pass}           label: hash_lookup   accepted
    event   A1→A2 transition: deleted 11 lines, no run in between
    event   A2 failure: WA; output indices refer to sorted order (detected: output ⊂ indices of sorted(nums))
    time_to_insight = 07:05 (first revision with final fingerprint, persisted to end)

L3  claim  "You abandoned the nested loop before running it, likely because you
            anticipated O(n²) would be too slow."        kind=inference conf=0.55 evidence=[A1, r4]
    claim  "Sorting reordered the array, so returned indices no longer referred
            to the original positions."                  kind=inference conf=0.9  evidence=[c1, r5]
    claim  mistake: category=conceptual/lost_information_by_transforming_input
                                                          conf=0.85 evidence=[c1, r5, r9]

L4  Journey step 2 (👁 rendered from A2 + c1): "Sort + two pointers (4:10–7:05) · ran 1× · wrong answer on [3,2,4]"
    Why it failed (💭 from claim, conf high): "Sorting lost the original indices."
```

---

## 2. The pipeline

Each stage is a **pure function** `(input, deps) → output` with typed input and
output schemas, run by an orchestrator that persists each stage's output and
metrics. Stages can be re-run individually (e.g., re-synthesize with a new
prompt without redoing analysis).

| # | Stage | Kind | Input → Output | Why this technique |
|---|---|---|---|---|
| 0 | **Capture** | Deterministic (extension) | page events → ops, checkpoints, results, context | Platform APIs |
| 1 | **Normalize** | Deterministic | raw upload → validated `SessionTrace` | zod validation, dedupe by seq, clock-skew fix (monotonic `t` relative to session start), redaction check |
| 2 | **Reconstruct** | Deterministic | trace → ordered revisions with full code, active-time timeline | Op replay is exact. Idle = hidden tab or no edits/focus > 60 s |
| 3 | **Analyze code** | Deterministic (tree-sitter) | each revision → `StructuralFeatures`; each consecutive pair → `RevisionDiff` | Parsing beats guessing. Cheap, testable, tolerant of broken code |
| 4 | **Segment attempts** | Deterministic heuristics | revisions + features → `Attempt[]` | Explainable boundaries; tunable against labeled data |
| 5 | **Analyze results** | Deterministic | executions + diffs → `ExecutionFacts`, `FixDiff[]`, mistake *candidates* | LeetCode results are structured. Fix-localization is diffing |
| 6 | **Problem profile** | LLM, **cached per problem, shared across users** | slug + title + tags → `ProblemProfile` | World knowledge of the problem. Generated once, reviewed for top problems |
| 7 | **Reasoning inference** | LLM (structured output) | compact trace + facts + profile → `Claim[]` | Interpreting *why* is the genuinely non-deterministic part |
| 8 | **Validate claims** | Deterministic | claims → accepted claims + rejections | Evidence IDs exist, quotes appear verbatim, timestamps consistent, enums valid |
| 9 | **Synthesize record** | LLM (structured output) | facts + validated claims + profile → `RecordDraft` | Writing the teach-back text: cue, insight, explanations, drills |
| 10 | **Classify** | LLM (small model) → closed enums | record + facts → pattern/concept/mistake taxonomy IDs | Constrained classification; enums prevent tag sprawl |
| 11 | **Render** | Deterministic | facts + claims + draft → `LearningRecord` (+ Markdown) | Templates make the observed/inferred split structural |
| 12 | **Memory update** | Deterministic (SQL, background job) | record → aggregates, mistake occurrences, (V1.5) review cards | Counting is not an AI task |

Embeddings: **none in V1.** "Related problems" come from taxonomy overlap in
your own history + the problem profile's canonical related list.

### Stage details that matter

**3 — Structural features (examples)**

```ts
type StructuralFeatures = {
  parses: boolean;                    // tree-sitter found no ERROR nodes
  loops: { depth: number; iteratesSameCollectionNested: boolean };
  dataStructures: Array<"hashmap" | "hashset" | "heap" | "deque" | "stack" | "sorted_container" | "array_2d" | "trie" | "union_find">;
  calls: { sort: boolean; bisect: boolean; recursion: boolean; memo: boolean };
  pointers: { twoIndexWhile: boolean; slidingWindowShape: boolean }; // lo/hi or l/r moving in a while
  functionsDefined: number;
  loc: number;
  fingerprint: string;                // stable hash of the above, used for segmentation + time-to-insight
};
```

Language support is per-grammar query files (`analysis/queries/python.scm`, …).
V0: Python. V1: + Java, C++, JavaScript/TypeScript.

**4 — Segmentation heuristic (v1)**

A new attempt starts at revision *r* when any of:

- fingerprint distance(r, r-1) ≥ threshold **and** the change persists ≥ 2
  revisions (so we ignore transient states)
- ≥ 50% of the previous code's lines were deleted within 30 s and replaced
- `context.reset` or `context.language_changed`

Then merge attempts shorter than 30 s with no execution into their neighbour.
Output includes the *reason* for each boundary (for debugging and UI).

**Time-to-insight** = active time from session start to the first revision
whose fingerprint equals the final accepted revision's fingerprint **and** all
later revisions keep that fingerprint. Undefined for unsolved sessions.

**5 — Fix localization and mistake candidates**

For each failing execution *e* followed by the next execution *e'* that fails
*differently* or passes: diff the two checkpoint codes and classify the fix with
rules first:

| Diff shape | Candidate category |
|---|---|
| changed `<`↔`<=`, `range(n)`↔`range(n-1)`, `len-1` | `implementation.boundary` |
| added early return on empty/size-1 input | `edge_case.empty_or_single` |
| changed initial value (`0`→`-inf`, `[]`→`[0]`) | `implementation.initialization` |
| reordered two statements (lookup ↔ insert) | `implementation.ordering` |
| TLE → changed data structure / removed nested loop | `complexity.too_slow` |
| compile error fixed by a small token change | `language.syntax` / `language.api` |
| no rule matches | `unknown`: LLM classifies in stage 7 with evidence |

Rules give **candidates with evidence**. The LLM can confirm, re-categorize
(with justification), or add conceptual mistakes rules can't see.

**6 — Problem profile (shared, cached)**

```ts
type ProblemProfile = {
  slug: string; version: number;
  essence: string;                     // "find two indices whose values sum to target"
  recognitionCues: string[];           // statement features that point at the pattern
  canonicalApproaches: Array<{ id: ApproachId; complexity: { time: string; space: string }; keyInsight: string }>;
  commonPitfalls: MistakeCategoryId[];
  patterns: PatternId[]; concepts: ConceptId[];
  relatedSlugs: string[];
  confidence: "reviewed" | "generated";
};
```

We **never store problem statement text** (copyright). The profile is
generated from the model's knowledge + slug/title/tags. For problems the model
doesn't know well (new problems), `confidence` is low and the record says so.
Top ~300 problems get human review over time.

**7 — Reasoning inference: prompt design**

Input is a **compact, deterministic text rendering** of Layer 1+2, not raw JSON
(fewer tokens, easier for the model):

```
PROBLEM two-sum (profile v3): essence=..., canonical=[brute_force O(n²), hash_lookup O(n)]
SESSION python · active 10m12s · outcome=accepted · editorial_viewed=no · pastes=0

ATTEMPT A1 [00:00–04:10] features: nested_loop_same_array · never run
  R3 @02:14
    1 | class Solution:
    2 |     def twoSum(self, nums, target):
    3 |         for i in range(len(nums)):
    4 |             for j in range(i + 1, len(nums)):
  R4 @04:10  DELETED lines 3-4 (11 lines total) in one operation
ATTEMPT A2 [04:10–07:05] features: sorts_input, two_index_while · ran 1×
  ...
  X1 @07:02 RUN → WRONG_ANSWER input=[3,2,4],6 expected=[1,2] got=[0,1]
  FACT: output indices match positions in sorted(nums), not nums
...
MISTAKE CANDIDATES
  M1 implementation.ordering evidence=[X2,X3] (lookup/insert swapped between X2 and X3)
```

The model returns `Claim[]` via structured output:

```ts
type Claim = {
  id: string;                          // assigned by us after validation
  type: "initial_instinct" | "abandon_reason" | "misconception" | "stuck_point"
      | "turning_point" | "insight" | "mistake" | "concept_demonstrated"
      | "concept_struggled" | "recognition_cue_missed";
  text: string;                        // second person, ≤ 2 sentences
  evidence: Array<{ ref: string; quote?: string }>;   // ref ∈ {A*, R*, X*, M*, E*}; quote must appear verbatim in ref'd code/output
  confidence: "low" | "medium" | "high";
  alternatives?: string[];             // other plausible explanations (shown on expand)
  taxonomy?: { mistake?: MistakeCategoryId; concept?: ConceptId; pattern?: PatternId };
};
```

System-prompt principles:
- "You are reconstructing reasoning from evidence. When the evidence supports
  several explanations, say so in `alternatives` and lower confidence."
- "Never state as fact anything not in the trace. Never describe code that is
  not quoted in the trace."
- "Prefer 'likely' / 'suggests' language for `medium`/`low`."
- "Do not praise, do not judge. Be specific."
- Few-shot examples from the golden set, including one with deliberately
  ambiguous evidence where the right answer is low confidence.

**8 — Validation (the anti-hallucination gate)**

Deterministic checks. A failed claim is **dropped and logged**, never repaired
silently:

1. Every `evidence.ref` exists in this session.
2. Every `quote` appears verbatim (whitespace-normalized) in the referenced
   revision's code or execution output.
3. Claims about ordering ("after the wrong answer you…") agree with timestamps.
4. `type=turning_point` must reference an attempt boundary or execution.
5. Taxonomy IDs are valid enum members.
6. `concept_demonstrated` requires the concept's feature to appear in the
   final accepted code (e.g., can't "demonstrate" heaps without a heap).
7. At most one `turning_point` and one `initial_instinct` per session.

Metric: **claim rejection rate by type and prompt version**. It should trend
toward 0. Spikes mean a prompt regression.

**9 — Synthesis**

Takes facts + validated claims + profile and writes only the *teach-back* text
fields of the record (cue, key insight, why-it-works, complexity justification,
drills, recall versions). It may reference claims by ID but cannot introduce new
claims about the user's behaviour. That's enforced by giving it a schema with
no free-form "journey" field: the journey is rendered from attempts and claims.

---

## 3. Execution model

- One pg-boss job `pipeline.run {sessionId, pipelineVersion}` per session,
  singleton-keyed by `sessionId`.
- Stages run **sequentially in one job** (whole pipeline ≈ 15–60 s). Each
  stage's output is persisted to `stage_runs` so a retry resumes at the failed
  stage.
- LLM calls: timeout 90 s, 2 retries with backoff on 429/5xx, 1 repair retry on
  schema validation failure.
- Stage 12 (memory update) is a separate job so aggregation bugs never block a
  record.
- Problem profiles are generated on first sight in a separate
  `problem.profile` job. The pipeline waits for it (singleton per slug).

### Versioning and regeneration

Every record stores `pipelineVersion`, per-stage `promptVersion`, and `model`.
Because we keep Layer 1 (revisions/executions) and Layer 2 is deterministic,
**any record can be regenerated** when prompts improve. That's why we keep
revisions long-term and can drop ops ([data model](06-data-model.md)).

User edits to claims (`edited`/`rejected`) are **preserved across
regeneration** and fed into the new run as constraints ("the user stated: …").

### Cost envelope (to verify in V0)

Compact trace for a typical session: 6–20k input tokens (dominated by code at
key revisions: we include full code only at attempt boundaries + checkpoints,
and diffs elsewhere). Output ≈ 2–4k tokens across stages. Problem profiles and
system prompts are prompt-cached. Target **≤ $0.10/session** in V0; optimize
to ≤ $0.05 before any free tier.

---

## 4. Evaluation ("don't blindly trust the LLM", operationalized)

| Layer | How it's tested |
|---|---|
| Deterministic stages (1–5, 8, 11, 12) | Unit tests + **golden traces**: recorded sessions with expected attempts, features, fix categories. Snapshot tests on rendered output. |
| LLM stages (6, 7, 9, 10) | `pnpm eval`: runs stages over the golden set with the real model, then scores: (a) schema-valid rate, (b) validator rejection rate, (c) taxonomy accuracy vs. hand labels, (d) **rubric-graded** claim quality (LLM-as-judge on a 1–4 rubric, calibrated monthly against 50 human-graded claims). Results committed as `evals/results/<date>-<promptVersion>.json` summary. |
| Production | Claim confirm/reject/edit rates per `(claimType, promptVersion)`. Any prompt change ships only if eval scores don't regress. |

The golden set starts with **your own V0 sessions** (with your
labels written immediately after solving: the only time the "why" is fresh).
Target 30 sessions by end of V0, 100 by V1.
