# Opportunity Matrix: 28 Candidates, Eliminated Down to 5

This document generates widely, then eliminates aggressively. Each candidate
traces back to a pain in [USER-PROBLEMS](../user-research/USER-PROBLEMS.md)
and a gap in [MARKET-MAP](../market-map/MARKET-MAP.md).

## How to read the scores

Scores run from 1 (bad) to 5 (good) and are **ordinal judgments, not
measurements**. Each one is justified by the evidence column. The scores
exist to make disagreements specific ("you gave Reach 4, but where exactly
are those users?"), not to compute a winner.

| Code | Dimension | Folds in |
|---|---|---|
| **Pain** | Intensity × frequency | pain intensity, frequency, emotional consequence |
| **Urg** | Urgency | is there a deadline or forcing event? |
| **Gap** | How badly current workarounds and products fail | workaround strength, dissatisfaction |
| **Try** | Willingness to try and pay | willingness to try, pay, or spend time |
| **Reach** | Can we name and reach the first 10–100? | niche clarity, accessibility of first users |
| **Depth** | Technical depth that is *necessary*, not decorative | technical depth, portfolio value |
| **Moat** | Defensibility, proprietary data, network effects | defensibility, data, network effects |
| **Grow** | Expansion without going generic | retention, expansion, company potential |
| **Fit** | Feasible for this builder, reuses real assets | feasibility for one strong student engineer |
| **Ev** | Quality of evidence behind the Pain score | evidence strength (🟢 5 · 🟡 3 · 🔴 1) |

---

## 1. Full candidate set

| # | Candidate | Pain | Urg | Gap | Try | Reach | Depth | Moat | Grow | Fit | Ev | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Solve-trace learning records** (Nue) for placement-season DSA grinders | 4 | 4 | 3 | 2 | 5 | 4 | 3 | 3 | 5 | 4 | **Top 5** |
| 2 | Plain LeetCode spaced-repetition extension | 4 | 3 | 2 | 1 | 4 | 1 | 1 | 1 | 5 | 4 | ✗ Six or more exist at ≤600 users [S26] |
| 3 | AI auto-notes + hints inside LeetCode | 3 | 3 | 1 | 2 | 3 | 2 | 1 | 2 | 4 | 3 | ✗ LeetCopilot [S27]. Helping while solving contradicts S01 |
| 4 | Codeforces weak-tag recommender | 3 | 2 | 1 | 2 | 4 | 3 | 1 | 1 | 5 | 3 | ✗ Six or more free clones [S32] |
| 5 | "Verified-human" CP rating | 3 | 2 | 4 | 2 | 1 | 5 | 4 | 3 | 1 | 3 | ✗ The buyer is the platform; unreachable |
| 6 | AI-enabled interview simulator (Meta format) | 4 | 5 | 2 | 4 | 3 | 4 | 1 | 2 | 3 | 3 | ✗ Served by AlgoMonster, interviewing.io etc. [S31] |
| 7 | General AI mock interviewer | 4 | 4 | 1 | 3 | 3 | 3 | 1 | 2 | 3 | 5 | ✗ Dozens exist |
| 8 | Peer mock-interview matching (India) | 4 | 4 | 2 | 3 | 4 | 2 | 3 | 2 | 3 | 3 | ✗ Two-sided cold start. Exponent/Pramp exist |
| 9 | **Comprehension ledger** for code built with AI agents | 4 | 2 | 4 | 2 | 3 | 5 | 3 | 5 | 4 | 4 | **Top 5** |
| 10 | Standalone "unaided cold-check" tests | 4 | 2 | 4 | 1 | 3 | 3 | 2 | 3 | 4 | 4 | ✗ Avoidance loop kills voluntary testing ([PSYCHOLOGY §4](../psychology/PSYCHOLOGY.md)). Absorbed into #9 as a by-product |
| 11 | Socratic AI tutor (no answers) | 3 | 2 | 1 | 3 | 3 | 2 | 1 | 2 | 4 | 4 | ✗ Frontier labs ship it [S39] |
| 12 | **Review gym** (find the defect in realistic AI-style PRs on real repos) | 4 | 3 | 4 | 3 | 3 | 5 | 4 | 4 | 3 | 4 | **Top 5** |
| 13 | Toy debugging drills | 3 | 2 | 2 | 2 | 3 | 2 | 1 | 2 | 5 | 3 | ✗ BugHunt (free) [S38] |
| 14 | Codebase onboarding guide generator | 3 | 3 | 1 | 2 | 2 | 4 | 1 | 3 | 3 | 3 | ✗ DeepWiki is free [S36] |
| 15 | AI code review of learners' projects | 2 | 1 | 1 | 2 | 3 | 2 | 1 | 2 | 4 | 3 | ✗ Commoditized |
| 16 | **Process-grounded viva** for programming instructors | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 3 | **Top 5** |
| 17 | Standalone process replay for instructors | 3 | 3 | 1 | 2 | 4 | 3 | 1 | 2 | 5 | 4 | ✗ CodeHS/Codio/zyBooks ship it [S21] |
| 18 | AI-written-code detector for courses | 3 | 4 | 2 | 3 | 4 | 3 | 1 | 1 | 4 | 3 | ✗ Unreliable. Adversarial framing contradicts instructor identity |
| 19 | **Proof-of-work build record** (verifiable "how I built it" for junior portfolios) | 4 | 4 | 4 | 3 | 3 | 5 | 4 | 4 | 3 | 2 | **Top 5** |
| 20 | "Honest LeetHub": verified unaided-solve record pushed to GitHub | 3 | 3 | 3 | 4 | 4 | 4 | 3 | 2 | 5 | 3 | ↪ Folded into #1 as its distribution mechanism |
| 21 | Maintainer-side newcomer vouching for OSS | 3 | 2 | 4 | 1 | 1 | 4 | 4 | 4 | 2 | 3 | ✗ The gatekeeper must adopt it. Unreachable |
| 22 | Good-first-issue matchmaker | 2 | 1 | 1 | 2 | 3 | 2 | 1 | 2 | 4 | 3 | ✗ Exists. Not the real barrier [S10] |
| 23 | Personalized learning roadmap | 3 | 2 | 1 | 2 | 3 | 2 | 1 | 2 | 4 | 3 | ✗ Generic, roadmap.sh |
| 24 | Side-project accountability | 2 | 1 | 2 | 2 | 3 | 1 | 1 | 2 | 4 | 2 | ✗ Generic productivity |
| 25 | Hackathon project continuation | 1 | 1 | 2 | 1 | 4 | 2 | 1 | 1 | 4 | 1 | ✗ No evidence anyone wants it |
| 26 | ML paper implementation verifier | 3 | 2 | 3 | 2 | 2 | 4 | 2 | 3 | 3 | 1 | ✗ Evidence too thin. Deep-ML/LeetGPU nearby |
| 27 | Placement-batch dashboard for colleges' placement offices | 3 | 4 | 3 | 3 | 3 | 2 | 2 | 3 | 3 | 1 | ✗ No evidence. Looks like a generic dashboard |
| 28 | Interview rejection post-mortem tool | 3 | 3 | 3 | 2 | 3 | 1 | 1 | 1 | 4 | 1 | ✗ Weak evidence. A thin product |

---

## 2. Why the survivors survived

None of the five wins on every dimension. Each survives for a *different*
reason, which is why they are not variations of one idea:

| # | Survives because… | Biggest weakness |
|---|---|---|
| 1 | The builder already has the design, the user is the builder, and the users are reachable (classmates, placement season) | Adjacent tools don't spread [S26]. Try = 2 |
| 9 | It is the cleanest white space (no learner-side product) with the strongest research base [S01, S04] | Urgency = 2. People may not want to know (avoidance) |
| 12 | It trains the skill that matters most in 2026 [S18], with real-bug datasets as an unused asset [S38] | Heaviest build. Unproven that learners will practice it |
| 16 | It has a forcing function (grades), a natural cohort (a course) and reachable buyers (faculty, via mark) | Institutional sales. Ethics of observing students |
| 19 | It attaches to the strongest adoption force found, *visibility* [S28], at the moment signals are collapsing [S16, S17] | Evidence = 2. Whether employers look is untested |

## 3. Notable eliminations, with the argument against

- **#6 AI-enabled interview simulator.** This was initially the most exciting
  candidate (urgent, paying users, a fresh format). It was eliminated because
  incumbents with distribution shipped rubric-scored simulators within a
  year [S31]. A student founder cannot out-distribute AlgoMonster in an
  interview-prep market. The lesson: **an urgent new problem attracts
  incumbents just as fast.**
- **#10 Cold-check tests.** The pain evidence is strong, but the product
  requires voluntary exposure to bad news, which the avoidance loop predicts
  people skip. The idea survives *inside* #9, where the check is a by-product of
  work already being done.
- **#2 and #4 (SRS, CP recommender).** These are the "student builds a LeetCode
  tool" trap. The space is full of competent free tools with a few hundred
  users each. Building another teaches nothing about distribution and impresses
  no one.
- **#17 and #18 (replay, AI detection for courses).** Replay is commoditized
  [S21], and detection is unreliable and adversarial. #16 keeps the
  instructor segment but changes the question from "did they cheat?" to "do
  they understand?".

## 4. Bias check

Three of the five survivors (1, 16, 19) reuse the process-capture
architecture the builder already designed. That could mean the asset is
genuinely valuable across problems, or it could mean we anchored on it. The
evidence for the gaps (§1.1, 1.4, 1.5 in MARKET-MAP) was gathered before
scoring Fit, but the reviewer should still discount Fit scores. Logged as
[DECISION-LOG D4](../decisions/DECISION-LOG.md).
