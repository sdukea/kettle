# Validation Plan

Nothing in `research/` has been validated with real users yet. This plan
defines how to change that, and when to stop. Opportunity-specific experiments
and kill criteria live in [TOP-5](../opportunities/TOP-5.md) §13 and §15. This
document holds what is shared across them.

---

## 1. Rules

1. **Kill criteria are written before the experiment and are binding.** If one
   triggers, record it in the [DECISION-LOG](../decisions/DECISION-LOG.md) and
   stop or pivot. Don't reinterpret it.
2. **Behavior over opinion.** "Would you use this?" is weak. "They came back
   unprompted" is strong. Opinions are recorded but don't pass a gate.
3. **No fake data in an experiment.** Concierge (human-made) outputs are fine
   if participants know a human made them.
4. **Consent and privacy:** written consent for any code or trace collected,
   anonymize before storing, delete after the experiment unless the person
   opts in. Follow the same principles as
   [docs/08](../../docs/08-privacy-security.md).

## 2. Close the Reddit gap first (1–2 days)

Our research tools couldn't reach Reddit ([D2](../decisions/DECISION-LOG.md)).
Before running any experiment, read by hand and log quotes, with URLs and
dates, into a new `research/user-research/REDDIT-NOTES.md`:

| Subreddit | Search terms | Looking for |
|---|---|---|
| r/leetcode | forget, retain, revisit, spaced repetition, notes | A1 frequency, workaround churn |
| r/developersIndia, r/Indian_Academia | placement, OA, DSA sheet, viva | Wedge for 1 and 4 |
| r/cscareerquestions, r/learnprogramming | can't code without AI, understand my own code, imposter | G1 and A4 first-person voices |
| r/ExperiencedDevs | juniors, code review, AI PRs | G2 and Catch |
| r/csMajors | capstone, AI, viva, project defense | Ledger |
| r/Professors | AI, oral exam, lab, viva | Viva |

The bar: **≥5 independent first-person posts per pain from the last 12
months.** If a pain falls below that, downgrade its evidence grade in
USER-PROBLEMS.

## 3. Problem interviews (week 1)

Interview **8 people per segment** for the chosen opportunity, plus 3 from a
second segment as a control. Hold them in person where possible (Bangalore).

**Script (30 min, never pitch before minute 25):**

1. "Tell me about the last time you [solved a LeetCode problem / committed
   agent-written code / ran a lab viva / applied off-campus]." (story, not
   opinion)
2. "What was hardest about it?" (let them name the pain; don't name it for
   them)
3. "When did you last discover you couldn't do something you thought you
   could? What happened next?" (tests the avoidance loop,
   [PSYCHOLOGY §4](../psychology/PSYCHOLOGY.md))
4. "What do you use today to deal with that? Show me." (the real workaround;
   ask for screenshots)
5. "Have you tried a tool for it and stopped? Why?" (why retention tools stall)
6. "How do you know whether you're getting better?" (their actual metric)
7. "What would you be willing to show a recruiter or teacher?" (visibility
   lever)
8. *(minute 25)* Show the concierge artifact. "What would you do with this?"

**Log:** one file per interview (anonymized ID), with observations kept
separate from interpretations.

**Pass signal:** ≥5 of 8 independently describe the pain *and* have tried a
workaround. Fewer than 3 is a kill signal for that opportunity.

## 4. Concierge experiment (weeks 2–3)

Run the experiment in TOP-5 §13 for the chosen opportunity. Each opportunity's
"what would kill it" (§15) is the pre-registered stopping rule.

## 5. Metrics that count

| Stage | Metric | Why |
|---|---|---|
| Interest | Joined after hearing the pitch, with no incentive | Separates polite from real |
| Activation | Completed the core action once (record read, question answered, exercise done, viva run) | The magic moment happened |
| **Retention** | **Repeated it unprompted in week 2** | The only metric that predicts a product |
| Visibility | Shared or published an output | Tests the adoption lever [S28] |
| Outcome | Measured improvement (re-solve time, catch rate, viva agreement) | The claim the product makes |

## 6. Timeline

| Week | Activity | Output |
|---|---|---|
| 0 (2 days) | Reddit pass | REDDIT-NOTES.md, evidence grades updated |
| 1 | 8 + 3 problem interviews | Interview logs, pass/kill on the pain |
| 2–3 | Concierge experiment | Behavior data against the kill criteria |
| 3 | Decision | A DECISION-LOG entry: build, pivot, or switch to the next opportunity |

Only after a pass does the second phase begin (product specification and
engineering roadmap), as the brief requires.
