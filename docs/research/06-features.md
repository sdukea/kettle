# 06 · Features: 60 candidates, classified

*Phase 11.* Classes: **A** commodity · **B** useful but common · **C**
differentiated · **D** extremely differentiated · **E** potential
category-defining. Complexity and defensibility: L/M/H. MVP: v0 / v1 / v2+
/ no.

| # | Feature | Class | Problem it solves | Why AI now | Complexity | Defensibility | MVP |
|---|---|---|---|---|---|---|---|
| 1 | AI-generated roadmap | A | "Where do I start?" | LLM decomposition | L | L | v1 (as output of the solver, not an LLM list) |
| 2 | Chat tutor | A | Explanations | LLMs | L | L | no (link to LLMs) |
| 3 | Progress bar | A | Visibility | — | L | L | Only evidence-based |
| 4 | Reminders | A | Forgetting to start | — | L | L | v2+, opt-in |
| 5 | Streaks | A | Habit | — | L | L | **no** (dark-pattern risk) |
| 6 | Calendar sync | B | Finding time | — | M | L | v2+ |
| 7 | Auto-scheduling | B | Deciding when | Optimization | M | L | no |
| 8 | Resource recommendations | B | Too many resources | Retrieval | M | L | v1 (one per gap) |
| 9 | AI summaries of resources | A | Time | LLM | L | L | no |
| 10 | Spaced review | B | Forgetting | — | M | L | v1 |
| 11 | Notes / journaling | A | Reflection | — | L | L | no |
| 12 | Templates per goal | B | Cold start | — | L | L | v1 (arrival-test templates) |
| 13 | Mock interviews with a human | B | Real practice | — | M | L | v0 (founder-run) |
| 14 | AI mock interviewer (voice) | B | Real practice | Speech + LLM | M | L | v2+ |
| 15 | Community forum | A | Support | — | L | L | no |
| 16 | **Arrival-test compiler** | D | Vague goals | LLM world knowledge | M | M | v1 |
| 17 | **15-minute position fix** | E | "Where am I?" | Item generation + grading | H | M→H | v0 (manual), v1 |
| 18 | **Skip list** | D | "What can I skip?" | Position estimate | M | M | v0 |
| 19 | **Probe-or-practise policy** | D | Studying blindly | Uncertainty model | M | M | v1 |
| 20 | **Readiness forecast (range)** | E | "Am I ready?" | Statistical model + outcomes | H | **H** (with data) | v1 (labelled uncalibrated) |
| 21 | **"You're ready" verdict** | D | Over-preparing, endless studying | Forecast | M | M | v1 |
| 22 | **Outcome reporting loop** | E | Closing the loop | — | L | **H** (data) | v0 |
| 23 | **IRT-calibrated probe bank** | D | Trustworthy measurement | LLM item generation + psychometrics | H | **H** | v1 (seed), grows |
| 24 | Explain-aloud probe with rubric grading | C | Shallow understanding | Speech + LLM grading | M | M | v1 |
| 25 | Bug-finding probe | C | Reading and debugging skill | LLM-generated bugs | M | M | v1 |
| 26 | "Your project" probe (questions on your own work) | C | Can you defend what you built? | LLM reads the repo | M | M | v2+ |
| 27 | **Unaided vs aided gap detector** | D | Illusion of competence | Compare scores with and without AI | M | M | v1 (probes are unaided) |
| 28 | Prerequisite misconception diagnosis | D | "You misunderstood P" | Error analysis | H | M | v2+ |
| 29 | **Plateau detection → change method** | D | Stuck doing more of the same | Learning curves | M | M | v2+ |
| 30 | Waste audit ("40% on things you knew") | C | Inefficiency | Position history | M | M | v2+ |
| 31 | What-if planner | C | Trade-offs | Solver + forecast | M | M | v2+ |
| 32 | Time-fit sessions (10/25/60 min) | C | "I only have 15 minutes" | Session generation | M | L | v1 |
| 33 | **Guilt-free reroute after lapse** | C | Abandonment after a miss | Re-solve | L | L (but culturally rare) | v1 |
| 34 | Deadline triage mode | C | Deadline moved up | Solver | M | L | v2+ |
| 35 | Season pause | B | Life events | — | L | L | v1 |
| 36 | True-budget learning | C | Planning fallacy | Behavior data | L | L | v2+ |
| 37 | Confidence calibration probe ("how sure?") | C | Over/underconfidence | — | L | M | v1 |
| 38 | Explain-the-why on every recommendation | C | Trust | Solver traces | L | L | v1 |
| 39 | Contest a judgement (re-probe on demand) | C | "It's wrong about me" | — | L | M (trust) | v1 |
| 40 | Real test as a probe (OA/interview feedback ingest) | D | The best signal goes unused | Parsing + mapping | M | H | v1 (manual entry) |
| 41 | **Published arrival tests** | E | "What does passing actually look like?" | — | M | **H** (network) | v2+ |
| 42 | Fork an arrival test | D | Reusing expert knowledge | — | L | H | v2+ |
| 43 | **Peer probes** | D | Practice partners plus virality | Rubrics make peers useful | M | M | v2+ |
| 44 | Cohort seasons | C | Shared deadline, motivation | — | M | M | v2+ |
| 45 | Cohort readiness view (student-controlled) | D | Placement cells flying blind | Aggregation | M | M | V3 (B2B) |
| 46 | "What can I skip in this course?" (URL in) | C | Course overwhelm | Map syllabus to graph | M | L | Growth tool, v2 |
| 47 | Evidence import (GitHub, practice history) | C | Cold start | LLM extraction | M | M | v2+ |
| 48 | Forgetting forecast | C | Decay | Half-life models | M | M | v1 (inside review) |
| 49 | Interview-morning plan | B | Last-minute panic | — | L | L | v2+ |
| 50 | Goal chaining | C | Churn on success | — | L | M | v2+ |
| 51 | Arrival guarantee (partial refund) | D | Trust, risk | Calibrated forecast | M | H (needs calibration) | V3 |
| 52 | **Calibration public report** ("when we say 70%…") | E | Can I trust this? | Outcome data | M | **H** | V3 |
| 53 | Position API for other products | E | Learners' position is siloed per app | — | H | H | V3+ |
| 54 | Expert graph authoring tools | D | Expanding domains | LLM-drafted graphs | H | H | V3 |
| 55 | Voice "Now" (hands-free next action) | B | Convenience | Speech | M | L | no |
| 56 | Wearable / ambient signals | B | Context | — | H | L | no (10x only) |
| 57 | Browser context ("you're watching a tutorial on a node you've mastered") | C | Wasted consumption | Extension | M | M | no (privacy; maybe 10x) |
| 58 | Accountability partner matching | B | Accountability | — | M | L | v2+ |
| 59 | Exportable personal learner model (portable) | D | Lock-in fear; trust | — | M | M (trust) | v2+ |
| 60 | Public profile / badges | A | Status | — | L | L | no |

## The top 10 category-defining features

1. **15-minute position fix** (#17)
2. **Readiness forecast with an honest range** (#20)
3. **Outcome reporting loop** (#22)
4. **IRT-calibrated probe bank** (#23)
5. **Arrival-test compiler** (#16)
6. **Skip list** (#18)
7. **Probe-or-practise policy** (#19)
8. **"You're ready" verdict** (#21)
9. **Published, forkable arrival tests** (#41/42)
10. **Public calibration report** (#52)

[I] The common thread: each one is about **measuring truthfully** and
**acting on the measurement**. None is about producing more plans or
content.
