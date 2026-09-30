# 07 — The Learning Record (Notes Architecture)

Covers design-doc section **11 (Notes architecture)**.

The record is **not a blob of AI text**. It is a typed document assembled from
three sources, and every field declares which source it comes from:

| Source | Marker | Produced by | Can be wrong? |
|---|---|---|---|
| **Observed** | 👁 | Deterministic rendering of trace facts | Only if there's a bug |
| **Inferred** | 💭 | Validated claims about *your* reasoning | Yes. Confidence shown, user can correct |
| **Reference** | 📘 | Teach-back content about the *problem* (profile + synthesis) | Rarely. It's about the algorithm, not you |

---

## 1. Design principles

1. **Layered for review speed.** The record is read far more often in 30-second
   glances than in full. The top of the document must stand alone.
2. **Retrieval over re-reading.** Wherever possible the record poses a question
   and hides the answer (recognition cue, why-it-works, complexity). Reading an
   answer is much weaker practice than trying to recall it.
3. **Your words first.** Use the user's own variable names, their comments, and
   their code. "`seen` maps value → index" beats "the hashmap stores
   indices".
4. **Recognition before implementation.** The first thing to remember is *what
   in the problem signals the pattern*. Implementation comes second.
5. **Contrast is memorable.** "You tried X, it failed because Y, so Z" sticks
   better than "Z". The journey exists to create that contrast.
6. **Short by construction.** Field-level length limits in the schema. The
   model can't write an essay if the schema doesn't allow one.
7. **Honest provenance.** Hints viewed, editorial viewed, code pasted:
   recorded plainly, without judgment, and reflected in "demonstrated" vs
   "assisted".

---

## 2. Layers

```
L0  CUE CARD        ~15 words     "Pair summing to target → remember what you've seen; look up the complement."
L1  30-SECOND       ~60 words     problem essence + recognition signal + key insight + complexity
L2  2-MINUTE        ~250 words    your journey compressed + why it works + the mistake to not repeat
L3  FULL RECORD     structured    every section below
L4  RAW TIMELINE    interactive   revisions/executions scrubber (not generated text)
```

---

## 3. Schema

Defined in `@nue/contracts` as zod. Shown here as TypeScript for readability.
`Obs<T>` = observed, `Inf<T>` = inferred (a claim reference), `Ref<T>` =
reference content.

```ts
type LearningRecord = {
  schemaVersion: 1;
  provenance: {
    pipelineVersion: string; models: Record<StageId, string>; promptVersions: Record<StageId, string>;
    signalTiers: ("t0" | "t1" | "t2")[]; degradedCapture: boolean; generatedAt: string;
    problemProfile: { version: number; confidence: "reviewed" | "generated" };
  };

  // ── HEADER (all observed) ────────────────────────────────────────────────
  header: Obs<{
    problem: { slug: string; title: string; difficulty: string; url: string };
    language: string; date: string;
    outcome: "accepted" | "attempted" | "abandoned";
    totalTimeMs: number; activeTimeMs: number;
    timeToFirstRunMs: number | null; timeToInsightMs: number | null;
    runs: number; submits: number; attempts: number;
    assistance: { viewedHints: boolean; viewedEditorial: boolean; viewedSolutions: boolean; pastedLines: number };
    priorSessionsOnThisProblem: number;      // re-solve context
  }>;

  // ── L0 / L1: RECALL LAYER ───────────────────────────────────────────────
  recall: {
    cue: Ref<string>;                         // ≤ 20 words: trigger → move
    essence: Ref<string>;                     // ≤ 25 words: what the problem reduces to
    recognition: {                            // THE most important retention field
      signals: Ref<string[]>;                 // statement features that point to the pattern (≤ 3)
      whatYouNoticed: Inf<string> | null;     // what, in the trace, suggests you picked up on (or missed) them
    };
    keyInsight: Ref<string>;                  // ≤ 30 words, phrased with the user's identifiers where possible
    thirtySecond: Ref<string>;                // ≤ 70 words
    twoMinute: Ref<string>;                   // ≤ 280 words; includes one sentence of *your* journey
  };

  // ── L3: YOUR JOURNEY ────────────────────────────────────────────────────
  journey: {
    initialInstinct: { approach: Obs<ApproachId>; interpretation: Inf<string> | null };
    attempts: Array<{
      index: number;
      approach: Obs<ApproachId>;
      span: Obs<{ startMs: number; endMs: number }>;
      whatYouDid: Obs<string>;                // rendered from features/diffs by template
      outcome: Obs<{ kind: "never_run" | "failed" | "accepted"; executions: ExecutionSummary[] }>;
      whyItFailedOrWasAbandoned: Inf<string> | null;
      codeAtEnd: Obs<{ revisionSeq: number }>; // UI links into timeline
    }>;
    stuckPoints: Array<{ span: Obs<{ startMs: number; endMs: number }>; signal: Obs<string>; interpretation: Inf<string> }>;
    turningPoint: { trigger: Obs<string>; realization: Inf<string> } | null;
    finalInsight: Inf<string>;                // what *you* realized, not the editorial's phrasing
  };

  // ── L3: THE SOLUTION ────────────────────────────────────────────────────
  solution: {
    yourFinalCode: Obs<{ revisionSeq: number; code: string }> | null;   // null if unsolved
    annotations: Array<{ line: number; note: Ref<string> }>;           // ≤ 6, only on non-obvious lines
    algorithmSteps: Ref<string[]>;                                     // ≤ 6 steps, imperative
    whyItWorks: { prompt: Ref<string>; answer: Ref<string> };          // invariant/argument, question-first
    complexity: {
      time: Ref<string>; space: Ref<string>;
      justification: { prompt: Ref<string>; answer: Ref<string> };
      vsYourEarlierAttempts: Ref<string> | null;                       // "your A1 was O(n²) because…"
    };
    implementationDetails: Array<{
      detail: Ref<string>;
      youHitThis: Obs<boolean>;               // did a fix-diff in your session touch it?
    }>;                                       // ≤ 5
    alternatives: Ref<Array<{ approach: ApproachId; tradeoff: string }>>;   // ≤ 3
  };

  // ── L3: LEARNING ────────────────────────────────────────────────────────
  mistakes: Array<{
    category: MistakeCategoryId;
    description: Inf<string>;
    evidence: Obs<{ executionSeq?: number; revisionSeq?: number; quote?: string }>;
    fix: Obs<string> | null;                  // rendered from fix-diff
    recurrence: Obs<{ previousOccurrences: number; lastSeenSessionId?: string }>;  // cross-session!
  }>;
  concepts: {
    demonstrated: Array<{ concept: ConceptId; evidence: Obs<string> }>;
    struggled: Array<{ concept: ConceptId; evidence: Obs<string>; interpretation: Inf<string> }>;
    assisted: ConceptId[];                    // appeared only after editorial/hint/paste
  };
  patterns: { primary: PatternId; secondary: PatternId[] };
  counterfactual: Inf<string> | null;         // "What would have made you faster": the single highest-leverage lesson
  rememberChecklist: Ref<string[]>;           // 3–5 items you should reproduce without looking

  // ── L3: CONNECTIONS ─────────────────────────────────────────────────────
  related: {
    fromYourHistory: Obs<Array<{ sessionId: string; slug: string; sharedPatterns: PatternId[]; sharedMistakes: MistakeCategoryId[] }>>;
    toTryNext: Ref<Array<{ slug: string; why: string }>>;   // ≤ 3, from profile, excluding solved
  };

  // ── DRILL (becomes review cards in V1.5) ────────────────────────────────
  drill: {
    interviewerFollowUps: Ref<Array<{ question: string; answerSketch: string; targetsYourMistake?: MistakeCategoryId }>>;  // 3–5
    edgeCases: Ref<Array<{ input: string; why: string; youMissedIt: boolean }>>;  // youMissedIt is Obs-backed
    reproduceWithoutLooking: Ref<string[]>;   // e.g. "write the one-pass loop with check-before-insert"
  };
};
```

`Inf<string>` is stored as a claim reference (`{ claimId, text, confidence }`),
so the UI can show confidence, alternatives, and confirm/reject controls, and
feedback carries over across regenerations.

### Improvements over the brief's list, and why

| Addition / change | Why |
|---|---|
| **Recognition signals** as a first-class field | Pattern recognition is the interview bottleneck. It's also absent from almost every notes tool |
| **Question-first `whyItWorks` / complexity justification** | Retrieval practice built into the note. Doubles as V1.5 review cards with no extra generation |
| **Counterfactual** ("what would have made you faster") | One actionable lesson per session beats ten observations |
| **`youHitThis` / `youMissedIt` flags** | Separates "gotchas in general" from "gotchas that bit *you*". The latter are what to review |
| **Mistake `recurrence`** (cross-session) | Turns a note into part of a longitudinal profile: "3rd time this month" |
| **Assisted concepts** | Keeps the demonstrated-skills profile honest |
| **Stuck points with observed signal** | "Stuck" is inferred from observable signals (long active time + low net change + repeated same failure), not vibes |
| **Related from *your* history first** | Personal connections ("like 3Sum, where you also sorted first") are more memorable than canonical lists |
| **Hard length caps** | Guarantees skimmability |
| **Provenance block** | Regeneration, debugging, trust |

### Unsolved sessions

Same schema, with `solution.yourFinalCode = null` and a different emphasis:
the record shows *where you got to*, the stuck point, and a **"next time,
try"** nudge. The full solution is **collapsed behind a "reveal" button**,
because an unsolved problem is the best candidate for a blind re-attempt, and
spoiling it wastes that.

---

## 4. Rendering

- **Web UI:** the canonical renderer. 👁 facts in normal text, 💭 inferences
  in a distinct style (italic + icon + confidence dot), with ✓/✗/✎ on hover.
- **Markdown:** a deterministic renderer in `@nue/contracts/render/markdown.ts`,
  used for export, "copy as Markdown", and Obsidian sync. Inferences render as
  `> 💭 *…* (medium confidence)` so the distinction survives export. YAML
  front-matter carries `slug`, `patterns`, `date`, `outcome` for Obsidian
  queries (Dataview).

Example (abridged):

```markdown
---
problem: two-sum
title: Two Sum
date: 2026-09-30
outcome: accepted
patterns: [hash_lookup]
time_to_insight_min: 7.1
---
# Two Sum: how you solved it

**Cue:** Pair summing to target → remember what you've seen, look up the complement.

**Recognize it by:** "return indices" · "exactly one solution" · input not sorted

## Your journey
1. **Brute force (0:00–4:10)**: nested loops over `nums`, deleted before running.
   > 💭 *Likely abandoned because you anticipated O(n²).* (low confidence)
2. **Sort + two pointers (4:10–7:05)**: 1 run, wrong answer on `[3,2,4]`.
   > 💭 *Sorting reordered `nums`, so the indices you returned referred to the sorted array.* (high)
3. **Hashmap complement (7:05–12:00)**: 2 runs, accepted.

**Turning point:** the wrong answer at 7:02 → rewrite with `seen = {}` at 7:05.
...
```
