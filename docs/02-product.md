# 02 — Product

Covers design-doc sections **1 (Product thesis)**, **2 (Core user loop)**,
**3 (Key product insights)**, **4 (Feature possibilities)**, plus the UX and
product-surface design.

---

## 1. Product thesis

**Solving a problem already produces the best possible study material. It
just evaporates.**

People preparing for interviews solve hundreds of problems and remember a
fraction of them. The existing tools each cover part of the gap:

- **LeetCode** keeps your *final* submissions. It's a record of answers, not
  of learning.
- **Editorials / YouTube / ChatGPT** explain *the* solution. It's someone
  else's reasoning, easy to nod along to and quickly forgotten.
- **Manual notes (Notion, Anki)** work, but cost 10–15 minutes per problem, so
  almost nobody keeps them up past week two.

Nue observes the *process* of solving (the abandoned approaches, the bugs, the
turning point) and turns it into a record of **how *you* solved it**. That
record is the input to a review system that targets **your** gaps with
**your** evidence.

The claim to prove:

> An automatically reconstructed record of *how you solved a problem* is more
> useful for retention and interview performance than the notes you'd write
> yourself, or a generic editorial.

### What Nue is not

- **Not a solving assistant.** Nue never shows hints, completions, or answers
  while you are solving. The moment the tool helps you solve, it contaminates
  the signal it's built on and trains dependency instead of skill.
- **Not a generic AI chat.** There is no chat box in V1. Every AI output is a
  structured artifact tied to evidence.
- **Not a scorekeeper.** No single "readiness score". Scores invite gaming and
  hide the evidence. We show evidence and trends.

---

## 2. Core user loop

```
            ┌─────────────────────────────────────────────────────┐
            │                                                     │
            ▼                                                     │
   ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐  │
   │ SOLVE          │──►│ RECORD (auto)   │──►│ REFLECT (2 min)│  │
   │ on LeetCode,   │   │ trace → journey │   │ read "how you  │  │
   │ Nue invisible  │   │ → learning rec. │   │ solved it",    │  │
   └────────────────┘   └─────────────────┘   │ correct wrong  │  │
                                              │ inferences     │  │
                                              └───────┬────────┘  │
                                                      ▼           │
                        ┌─────────────────┐   ┌────────────────┐  │
                        │ ADAPT           │◄──│ REINFORCE      │  │
                        │ weaknesses →    │   │ spaced review, │──┘
                        │ what to solve / │   │ blind recall,  │
                        │ review next     │   │ explain-it     │
                        └─────────────────┘   └────────────────┘
```

Two loops at different speeds:

- **Inner loop (per problem, minutes):** Solve → Record → Reflect.
  This proves the thesis and is the V0/V1 product.
- **Outer loop (across problems, weeks):** Reinforce → Adapt.
  This is the retention product (V1.5+) and the thing people will pay for.

**Reflect is essential.** The two-minute read after a solve, where the user
confirms or corrects Nue's inferences ("No, I didn't misunderstand the
problem, I just typo'd"), is:

1. a learning act in itself (retrieval + self-explanation),
2. the ground-truth label that measures and improves inference quality,
3. what builds trust: users see that Nue knows the difference between what it
   saw and what it guessed.

---

## 3. Key product insights

1. **The deleted code is the signal.** The difference between you and the
   editorial is *what you tried first*. The first approach reveals your default
   instinct, and default instincts are what interviews expose.

2. **The recognition cue matters more than the algorithm.** In interviews,
   people rarely fail because they can't implement a hashmap. They fail because
   they didn't *see* that the problem wanted one. So the most valuable field in
   a note is: *"What in the problem statement should have told you
   'complement lookup'?"* Almost no study tool captures this explicitly.

3. **Observed vs. inferred is a trust feature, not a disclaimer.** "You
   replaced the nested loop with a dict at 11:42" is a fact. "You realized
   lookups were the bottleneck" is a guess. Showing both, visibly different,
   makes the guesses *more* credible, because users can check them.

4. **Time-to-insight beats time-to-solve.** Total time mixes thinking with
   typing and debugging. Time from start to the first revision that contains the
   final approach's structure measures pattern recognition directly, and it
   should *drop* on re-solves as learning happens.

5. **Mistakes cluster by person, not by problem.** One user misses empty-input
   edge cases everywhere. Another knows every pattern but fights off-by-one in
   binary search. These show up only across many sessions, and only if
   mistakes are **categorized into a stable taxonomy** rather than free text.

6. **Your history is better review material than any curated list.**
   "Explain why the hashmap works" is fine. "Last time you tried two pointers
   first and it failed on unsorted input. Why?" is far better: it's specific,
   personal, and targets an actual misconception.

7. **The best note is short.** A 2,000-word generated essay per problem will
   not be re-read. The note must be *layered*: one-line cue → 30-second recall
   → full journey → raw timeline. Most reviews touch only the first two layers.

8. **Honesty beats flattery.** If you pasted a solution or read the editorial,
   the record says so, without judgment. Otherwise the "concepts demonstrated"
   profile becomes fiction and every downstream feature is poisoned.

---

## 4. Feature possibilities

Each candidate, evaluated. "Signal" = what data it needs. "Phase" = when it
earns its place.

| # | Feature | What it really is | Signal | Risk | Phase |
|---|---|---|---|---|---|
| A | **Automatic learning record** | The core artifact | T0+T1 | Inference quality | **V0** |
| B | **Reasoning timeline** | Visual of attempts → pivots → solution, with code at each point | T0+T1 | Low; mostly deterministic | **V0 (text) / V1 (UI)** |
| C | Struggle map | Aggregate time/error/struggle by concept | Many sessions + taxonomy | Needs volume (~30 sessions) | V1.5 |
| D | Pattern graph | Problems ↔ patterns ↔ concepts graph | Taxonomy tags | Pretty but low utility early | V2 (list first in V1.5) |
| E | **Retention / spaced review** | FSRS scheduling of review cards derived from notes | Notes + review outcomes | Engagement design | **V1.5** |
| F | Interview mode | Oral-exam style Q&A on your own history | Notes + LLM grading | LLM grading reliability | V2 |
| G | **Personal error profile** | Evidence-thresholded mistake patterns | Categorized mistakes across ≥3 problems | False patterns | V1.5 |
| H | Approach quality | Classify first-instinct approach type, track shift | Segmented attempts | Label noise | V1.5 (as data), V2 (UI) |
| I | **Time-to-insight** | Deterministic metric per session | T1 + fingerprints | Fingerprint accuracy | **V1** (in record) |
| J | Re-solve prediction | FSRS stability ≈ "when you'll forget" | Review history | Needs months of data | V2 (FSRS gives it "for free" once E exists) |
| K | **Blind recall** | Explain/sketch before revealing the note | Notes | None | **V1.5** (a review card type) |
| L | Personal pattern library | Patterns ranked by *your* evidence, with your problems as examples | Taxonomy + records | None | V1.5 |
| M | Interview readiness | Evidence summary per topic, no score | All of the above | Over-claiming | V2 |
| N | Re-solve comparison *(new)* | Solve a problem again, diff journeys: faster insight? same bug? | Two sessions of same problem | None; strong learning proof | V2 |
| O | "Before you look" gate *(new)* | When you open Editorial mid-solve, Nue can (opt-in) ask you to write one line of what you're stuck on first | Route events | Annoyance, so opt-in only | V2 |
| P | Correct-the-record *(new)* | Accept/reject/edit each inference | UI | None; it's the eval signal | **V1** |
| Q | Mistake → drill *(new)* | Recurring mistake generates a targeted micro-exercise ("write the loop bounds for binary search on [lo, hi)") | G + LLM | Quality | V2 |

**Rejected ideas**

- Live hints / "you seem stuck" nudges while solving: violates the core
  principle.
- Leaderboards, streak shaming, social feeds: optimizes the wrong behaviour.
- A single readiness score: see thesis.
- Chat with your notes: generic, low value relative to cost, invites
  hallucination. Maybe much later as a search affordance.

---

## 5. UX design

### Principle: invisible while solving, quiet after, rich when asked

**While solving, Nue shows exactly one thing:** the extension toolbar badge.

- ● red dot = recording this problem
- ‖ grey = paused (by you)
- ○ none = not a problem page (not recording, cannot record)
- ▲ amber = recording degraded (e.g., editor hook failed, checkpoints only)

Clicking the badge opens a tiny popup: *Recording "Two Sum" · 14 min ·
[Pause] [End session] [Discard session]* and a link to open Nue. A
keyboard shortcut (`⌥⇧P`) toggles pause. **No in-page overlays in V1.** An
optional small in-page pill can come later if users ask for it, off by default.

**After solving:** when the session ends (Accepted + idle, or manual end), the
badge shows a small ✓ and a desktop notification, **off by default**, says
"Your notes for Two Sum are ready". Nothing interrupts the next problem.

### First-run experience (target: < 2 minutes)

```
1. Install extension (Chrome Web Store)
   └─ Chrome prompt: "Read and change your data on leetcode.com"  ← the only permission
2. Extension opens nue.app/welcome
   ├─ Sign in (GitHub / Google / email link)
   ├─ "Connect this browser" (auto-pairing, one click)
   └─ Consent screen — plain language, 5 bullets:
        • Nue records the code you write in the LeetCode editor, and your run/submit results.
        • Nue never records keystrokes, other tabs, other websites, or your screen.
        • Code is sent to Nue's servers and to <AI provider> to generate notes.
          Neither trains models on it.
        • Detailed edit history stays on this device unless you choose to upload it.
        • You can pause, discard any session, export, or delete everything at any time.
      [ I understand, start recording ]   [ Customize ]
3. "Solve any problem. Your notes will appear here."
```

### After a few days: the Home screen

```
┌─────────────────────────────────────────────────────────────────┐
│ Today                                           Sep 30          │
│                                                                 │
│  4 solved · 1 unsolved         Time-to-insight ▼ 22% this week  │
│                                                                 │
│  ┌ Needs your eyes ──────────────────────────────────────────┐  │
│  │ ● Longest Substring Without Repeating   2 inferences to   │  │
│  │                                          confirm → 1 min  │  │
│  │ ● Coin Change (unsolved)                 see where you    │  │
│  │                                          got stuck        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Recurring this week                                            │
│   ↻ Off-by-one in window shrink condition     3 problems        │
│                                                                 │
│  Due for review (V1.5)                                          │
│   Two Sum · Valid Anagram · Group Anagrams          [Start 6m]  │
│                                                                 │
│  Recent                                                         │
│   Two Sum          Easy   hashing        ✓ 12m  insight @ 7m    │
│   3Sum             Med    two pointers   ✓ 31m  insight @ 19m   │
│   ...                                                           │
└─────────────────────────────────────────────────────────────────┘
```

There are no vanity counters ("New patterns discovered: 3"). Every number
links to evidence.

### The learning record page (the core screen)

Layered top to bottom, from fastest to deepest:

```
Two Sum · Easy · Python · Sep 30 · Solved in 12m (active 10m) · insight at 7m
────────────────────────────────────────────────────────────────────────
CUE        "Pair summing to target → store what you've seen, look up the complement."
RECOGNIZE  Signal in the problem: "return indices" + "exactly one solution" + unsorted.
────────────────────────────────────────────────────────────────────────
YOUR JOURNEY                                              [timeline ▸]
 1. Brute force, nested loops (0:00–4:10)     never run · abandoned
    👁  You wrote two nested loops over nums, then deleted them.
    💭  Likely abandoned because you anticipated O(n²).     [✓] [✗] [edit]
 2. Sort + two pointers (4:10–7:05)           ran 1× · wrong answer
    👁  Sorted nums, returned indices of the sorted array. Failed on [3,2,4].
    💭  Sorting lost the original indices.                  [✓] [✗] [edit]
 3. Hashmap complement (7:05–12:00)           ran 2× · accepted
    👁  Fixed: checked map before inserting (the [3,3] case).
────────────────────────────────────────────────────────────────────────
TURNING POINT   The wrong answer on [3,2,4] (7:02) → rewrite to dict (7:05)
KEY INSIGHT     You need original indices, so don't sort. Trade space for time.
────────────────────────────────────────────────────────────────────────
SOLUTION  (your final code, annotated)   · why it works · O(n) / O(n) because…
MISTAKES  ⚠ Sorting destroyed index info  (conceptual · seen 2× before)
          ⚠ Insert-before-lookup duplicate bug  (implementation)
REMEMBER  ☐ Check-then-insert order   ☐ Why not sort   ☐ One-pass variant
────────────────────────────────────────────────────────────────────────
DRILL     Interviewer follow-ups (4) · Reproduce without looking · 2-min explanation
```

👁 = observed (rendered from facts; always true to the trace).
💭 = inferred (from the model; has confidence; user can confirm/reject/edit).

### Product surfaces: what belongs in V1

| Surface | V1? | Reason |
|---|---|---|
| Extension popup (capture status + controls) | ✅ | Required for trust and control |
| Home / Today | ✅ (minimal) | Entry point; "needs your eyes" drives reflection |
| Problem history (list, filter by pattern/outcome) | ✅ | Basic navigation |
| **Learning record** (with journey + inline timeline) | ✅ | The product |
| Reasoning timeline as a separate full screen | ❌ → inline in record | A scrubber with code at each revision, embedded in the record |
| Settings / privacy / data (export, delete, retention) | ✅ | Non-negotiable |
| Review queue | V1.5 | Needs notes to exist first; V1 validates notes |
| Mistake profile | V1.5 | Needs volume and taxonomy stability |
| Pattern library | V1.5 | Same |
| Interview mode | V2 | Needs grading reliability |
| Pattern graph visualization | V2 | Nice, not needed |

**V1 = 5 screens:** popup, Home, History, Record, Settings.
