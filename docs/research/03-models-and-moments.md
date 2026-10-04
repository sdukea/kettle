# 03 · What is a roadmap? And the "holy shit" moment

*Phases 4 and 5.*

## Twelve conceptual models of "roadmap"

Scored 1–5 on: **E**xplains failure (does it address *why* people fail?),
**A**daptivity (can it actually adapt, or only regenerate?), **M**oat
(does it accumulate something hard to copy?), and **B**uildability for a
tiny team.

| # | Model | What a roadmap is | E | A | M | B | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Checklist | An ordered list of steps | 1 | 1 | 1 | 5 | Commodity |
| 2 | Curriculum | A syllabus of content units | 2 | 1 | 2 | 4 | That's a course |
| 3 | Skill graph | Nodes plus prerequisites | 3 | 3 | 3 | 3 | Necessary substrate, not the product |
| 4 | **GPS navigation** | Destination + **position** + route + reroute + ETA | 5 | 5 | 4 | 3 | **User-facing model** |
| 5 | Compiler | Intention → executable behavior | 3 | 2 | 2 | 4 | Good for the intake step only |
| 6 | **Test-driven goal** | Acceptance tests you can't pass yet; route = make tests pass | 5 | 4 | 4 | 4 | **Defines the destination** |
| 7 | Portfolio of bets | Experiments with kill criteria (for uncertain goals like "start a company") | 4 | 4 | 2 | 3 | Right for type-E goals (below); later |
| 8 | Coach relationship | An ongoing dialogue | 3 | 3 | 2 | 4 | Chatbot trap |
| 9 | **Control system** | Setpoint, sensor, estimator, controller, actuator | 5 | 5 | 5 | 2 | **Engineering model** |
| 10 | Fork-able journeys | Other people's real paths you can copy | 2 | 1 | 4 | 3 | Social layer, later |
| 11 | Forecast | A weather forecast for your goal | 4 | 4 | 5 | 2 | Output of 9, once calibrated |
| 12 | Deliberate-practice loop | Targeted practice on the weakest sub-skill with feedback (Ericsson) | 4 | 4 | 2 | 4 | The inner loop of 9 |

**Chosen abstraction:** a **control system** (9) whose setpoint is an
**arrival test** (6), presented to users as **GPS navigation** (4), with
deliberate practice (12) as the inner loop and a calibrated forecast (11)
as the long-term output.

```
setpoint     = arrival test               ("pass the internship OA")
sensor       = probes                      (short unaided performances)
estimator    = learner model               (position + uncertainty per skill node)
controller   = next-action policy          (practise / probe / review / rest / apply)
actuator     = the user doing the session
disturbance  = life                        (missed days, new deadlines)
```

[I] The reframe this forces: in a control system, a **bad sensor** ruins
everything downstream. Existing products have excellent controllers
(plans) and no sensor. That's the gap.

### Goal types (why "everything" doesn't work yet)

| Type | Example | Arrival test | Cheap sensor? | Fit |
|---|---|---|---|---|
| A. Skill with an external test | Pass an interview, an exam, a race time | External, dated | Yes | **Wedge** |
| B. Skill, self-defined | Learn guitar, French | Constructible | Mostly | Year 2–3 |
| C. Project | Write a book, launch a channel | Output-based | Partly (artifacts) | Later |
| D. Behavior / body | Lose 10 kg, read the Bible | Measurable outcome | Yes, but the domain is behavior, not skill | Different product |
| E. Uncertain venture | Start a company, move country | Mostly unknowable | No | Portfolio-of-bets model, later or never |
| F. Identity | "Become a photographer" | Must be compiled to A–C | Depends | Compile, then route |

## The "holy shit" moment: 25 candidates

Scored on: is it surprising, is it *true* (deliverable with honesty), and
is it achievable early. ★ = finalist.

| # | Capability | Surprise | True early? | Notes |
|---|---|---|---|---|
| 1 | ★ **15-minute position fix with a skip list** | High | Yes | Chosen. Being *seen accurately*, then given time back |
| 2 | ★ **"You're ready. Stop studying."** | High | After calibration | The second moment |
| 3 | ★ Honest ETA: "at this pace, Nov 20; you have Dec 1" | High | As a range | Part of 1 |
| 4 | "Don't study. Take this 6-minute check first." | Medium-high | Yes | Probe-or-practise policy |
| 5 | Arrival test compiled from a vague goal | Medium | Yes | Clarity moment at intake |
| 6 | "You misunderstood this prerequisite": diagnosed from your errors | High | Partly | Error-pattern analysis |
| 7 | "Your method isn't working; switch from X to Y" (plateau detection) | High | After weeks | Needs history |
| 8 | Reroute after missing a week, with no guilt | Medium | Yes | Strong in retention |
| 9 | "People at your position passed X% of the time" | Very high | Only with data | The moat surfacing |
| 10 | Spoken explanation graded on reasoning | Medium | Yes | Probe type |
| 11 | "You've spent 40% of your time on things you already knew" | High | After 2 weeks | Waste audit |
| 12 | What-if planner: "drop DP, add system design → 9 days sooner" | High | Yes, rough | Forecast plus counterfactual |
| 13 | Session sized to exactly the minutes you have now | Medium | Yes | Time-aware next action |
| 14 | Real test as a probe: upload OA feedback and it updates | Medium | Yes | Outcome loop |
| 15 | Forked arrival test from someone who passed last month | Medium | Needs community | Social object |
| 16 | Peer probe: run a mock for a friend with a rubric | Medium | Yes | Viral loop |
| 17 | Detects the gap between practice and unaided performance | High | Yes | Bastani-style guardrail |
| 18 | Auto-imports past evidence (GitHub, LeetCode history) for an instant prior | High | Partly | Privacy-sensitive |
| 19 | "What can I skip?" for any course URL | Medium | Yes | Wedge marketing tool |
| 20 | Forgetting forecast: "you'll lose hashing by next week; 4-minute review" | Medium | Yes | Spaced review |
| 21 | Batch forecast for a cohort ("the batch is 60% ready") | Medium | Needs a cohort | B2B hook |
| 22 | Explains *why* each step is on the route ("because you failed probe 3") | Medium | Yes | Trust builder |
| 23 | Interview-day plan: what to review the morning of | Low-medium | Yes | Nice touch |
| 24 | Detects goal drift ("your stated goal changed; reroute?") | Medium | Yes | |
| 25 | Ambient position from normal work (no explicit probes) | Very high | No (10x) | Long-term |

**Chosen:** #1 as the first-session moment, #2 as the retention-defining
moment, and #9 as the moat-revealing moment once data exists. Rejected as
headliners: anything requiring a chatbot, anything about scheduling, and
anything about social features. They're commodity or later-stage.
