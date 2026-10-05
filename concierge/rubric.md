# Rubric

## Scoring a check (0–3)

| Score | Code (C) | Approach (A) | Bug (B) | Explain (E) |
|---|---|---|---|---|
| **3** | Correct, within time, states complexity unprompted | Right approach and structure with a clear "why"; correct complexity | Finds and fixes the bug and gives a breaking input, within time | Correct, clear, and complete without prompting |
| **2** | Correct with one nudge, or up to 50% over time, or one small bug they fix when asked | Right approach after one nudge, or complexity slightly off | Finds the bug but the fix or breaking input needs a nudge | Mostly right; one gap they fill when asked |
| **1** | Right direction but can't finish, or a major bug | Partly right (works but brute force, or wrong structure) | Senses the problem area but can't pin the bug | Vague or partly wrong |
| **0** | Wrong approach or nothing working | No workable approach | Doesn't find it | Can't explain it |

A "nudge" is one question like "what structure gives fast lookup?" Never give
the answer during a check. Log every nudge in the notes.

## Topic status

Recompute after every check. Use the most recent evidence.

| Status | Rule |
|---|---|
| **Solid** | Latest score on the topic is ≥ 2 **and** at least one Medium (or two Easy checks for Easy-only topics) scored ≥ 2 |
| **Shaky** | Latest score is ≥ 2 but only on one Easy check, **or** results are mixed (a 3 and a 1) |
| **Gap** | Latest score ≤ 1 |
| **Unknown** | No check yet |

**Implied credit:** if a topic is Solid, mark its prerequisites Solid
(implied) unless a direct check says otherwise. Write it as `Solid*` in the
sheet so you know it wasn't measured directly. Example: Solid on A08 sliding
window implies hashing (T03) and two pointers (T04).

## The skip list

Everything Solid or Solid\* goes on the skip list. Write it in terms the
student uses ("arrays, hashing, two pointers"). As a percentage:

```
skip % = (Core + Common topics that are Solid or Solid*) ÷ (Core + Common topics) × 100
```

There are 26 Core + Common topics. Round to the nearest 5%. Never claim a
skip for a topic that's Unknown.

## Picking gaps to name

Name **two, at most three**, gaps in the result:
1. Gap topics whose prerequisites are Solid (they can start today).
2. Among those, the higher tier first (Core before Common), then the default
   order in [skill-map.md](skill-map.md#default-topic-order-when-two-gaps-tie).
3. Note any Unknown Core topic as "not checked yet". The next re-check covers
   it.

## Ready-by estimate (rough until there's outcome data)

1. Count what stands between the student and "ready" for their destination:
   - each **Gap** that must be Solid: **3 sessions**
   - each **Shaky** that must be Solid: **1.5 sessions**
   - each **Unknown** Core topic: **1 session** (a check, then plan)
   - the final mock: **2 sessions**
2. Sessions per week = (hours per week × 60) ÷ 25, using the hours they gave
   you. After week 1, use the sessions they actually did.
3. Weeks needed = total sessions ÷ sessions per week.
4. Give a **range**: weeks × 0.8 to weeks × 1.3, as calendar dates.
5. If the late end of the range is after their test date, say so plainly and
   say what you'd drop (Common topics before Core).

Always label it: "a rough estimate from a small sample; it gets sharper each
week."

## Running a position fix

**0–3 min.** Confirm the destination and date. Say: "This is to find what you
can skip. There's no score, nothing is shared, and there are no hints during
checks so the result is accurate."

**3–27 min.** Run 4–6 checks from the
[suggested path](checks.md#suggested-position-fix-path-30-minutes). Ask
confidence first each time. Score silently. Take notes on *how* they think:
where they stall, what they reach for.

**27–30 min.** Ask: "Anything you think I should know about where you are?"
Tell them the written result arrives within 2 hours.

**After the call.** Update the sheet, compute topic status, the skip list,
two gaps and the range, then send the [result message](messages.md#position-fix-result).

## Weekly re-check (15 minutes)

- 1–2 checks on the gaps they've been practising (use a check they haven't
  seen; repeat-free if possible).
- 1 check on a topic still Unknown.
- Update status and the range; send the [weekly update](messages.md#weekly-update).

## The "ready" call

Only say "ready" when the destination's rule in
[skill-map.md](skill-map.md#destinations-what-ready-means) holds **and** they've
passed a timed mock. Then send the [ready message](messages.md#ready). If
you're unsure, run one more mock. A wrong "ready" costs more trust than a late
one.
