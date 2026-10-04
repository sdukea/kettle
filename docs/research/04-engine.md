# 04 · The engine: what to know, how to plan, what to do now

*Phases 6, 7 and 8.*

## Phase 6: what the system should know about a person

Principle: **collect evidence, not adjectives.** "Learning style" is a
well-known neuromyth (matching instruction to self-reported styles lacks
support; Pashler et al. 2008, established). Don't ask for it.

| Dimension | How obtained | Notes |
|---|---|---|
| Destination and deadline | **Explicit** | One question each |
| Weekly time budget | **Explicit**, then **learned** | People overestimate (planning fallacy); the system learns the true budget from behavior and says so kindly |
| Current skill position | **Measured** (probes) | Never self-report alone; self-report is used only as a prior |
| Prior experience | Explicit (short) or imported evidence | Optional GitHub or practice-history import, user-initiated |
| Retention / forgetting rate | **Learned** | Per user and per skill node |
| Pace (learning rate per node) | **Learned** | Drives the ETA |
| Failure patterns | **Inferred** from errors | E.g. "stalls on choosing a data structure" |
| Lapse pattern | **Learned** | Which days and times sessions actually happen |
| Energy / available minutes now | **Explicit at the moment** (one tap: 10 / 25 / 60 min) | Don't infer mood |
| Constraints (exam timetable, job) | Explicit, optional | Used for the route |
| Budget for paid resources | Explicit, optional | Resource ranking |
| Confidence | **Measured as calibration** | Ask "how sure?" before a probe; the gap between confidence and result is itself informative |
| Social environment | Opt-in only | Peers for peer probes |
| Calendar / email / browser | **Not in v1** | High creep, low marginal value early |

**Never collect:** health or mental-health data, inferred emotional state
from text, contacts, location, protected characteristics, anything for
employer- or recruiter-facing scoring without explicit, revocable,
per-item consent.

**How the model sharpens:** prior (stated experience) → position fix
(probes) → every session's micro-check → weekly re-probe → real-world
outcome. The uncertainty per node shrinks; where it stays wide, the policy
schedules a probe.

## Phase 7: architecture

```
INPUT ──► UNDERSTANDING ──► PLANNING ──► EXECUTION ──► OBSERVATION ──► ADAPTATION
 goal       compile           route        session        probe          update model
 date       arrival test      next action  (unaided)      micro-check    reroute
 hours      skill graph       schedule                    outcome        recalibrate
```

| Stage | Component | LLM or classical? | Notes |
|---|---|---|---|
| Understanding | **Arrival-test compiler**: goal → acceptance criteria | LLM + templates | Templates per destination in the wedge; the LLM fills in specifics; the user edits |
| Understanding | **Skill graph**: nodes, prerequisites, weights toward the arrival test | Curated, LLM-drafted | Hand-curated for the wedge (~150–300 nodes); the LLM drafts, an expert corrects |
| Observation | **Probe bank**: items per node with difficulty | LLM-generated, **IRT-calibrated** from response data | Auto-gradable items preferred (code with tests); open items graded by rubric |
| Observation | **Grader** | Test runner + LLM rubric grader | The LLM grader reports uncertainty; low-confidence grades trigger another item, not a verdict |
| Estimation | **Learner model**: P(mastery) per node + uncertainty | **Classical** (BKT/IRT-style; later a small neural KT model) | Specialized KT models beat LLMs at this and cost far less [F, S20]; propagate evidence along prerequisites (cf. FIRe [S19]) |
| Estimation | **Forgetting model** | Classical (half-life regression-style) | Schedules reviews |
| Planning | **Route solver**: shortest path to the arrival test under time and deadline constraints | Classical optimization (weighted DAG plus scheduling heuristics) | Explainable by construction |
| Planning | **Next-action policy** | Classical scoring (see Phase 8) | |
| Planning | **Forecast**: P(pass by date) | Statistical model; calibrated on outcomes | Shown as a range; "uncalibrated" label until N outcomes |
| Execution | **Session generator**: practice plus explanation plus one best resource link | LLM, constrained | Must not reveal answers during probes (guardrails per Bastani [S4]) |
| Adaptation | **Recalibration jobs** | Batch | Item difficulty, forecast calibration, graph weights |

**Rule of thumb:** LLMs *compile, generate and grade*; classical models
*estimate, optimize and forecast*. That split makes the system cheaper,
more stable, more explainable, and harder to clone with a prompt.

**Verification.** Every LLM-generated item passes automated checks (tests
pass on the reference solution; difficulty is plausible) before entering
the bank. New items are served as "unscored warm-up" until they have
enough responses to calibrate.

## Phase 8: "What should I do right now?"

### The policy

Each candidate action *a*, given available minutes *t*:

```
score(a) = [ Δ P(pass arrival test) expected from a
           + value-of-information(a)            ← for probes
           + forgetting-risk averted(a)         ← for reviews ]
           / minutes(a)
           × feasibility(a, t, energy)
```

Action types: **practise** a gap node, **probe** an uncertain node,
**review** a decaying node, **apply** (a real-world step, e.g. "apply to 5
roles"), **rest**, or **stop** ("you're ready").

### What the system can say, and the signal behind it

| Statement | Triggered by |
|---|---|
| "Don't do X yet." | X's prerequisites have P(mastery) < threshold |
| "Skip Y." | Y has high P(mastery) with low uncertainty, or Y has low weight toward the arrival test |
| "You're ready for Z." | Prerequisites crossed the threshold on recent evidence |
| "You're spending too much time here." | Time on node ≫ expected for the gain; flat mastery curve |
| "You've misunderstood this prerequisite." | Error pattern on Z traces to node P (diagnostic items) |
| "Your approach is inefficient." | Plateau: ≥3 sessions without position gain → change the method (worked examples ↔ retrieval ↔ harder problems) |
| "Your goal changed, so your route should." | New destination, date or hours → re-solve; show the diff |
| "Take a 6-minute check before studying." | High uncertainty on a high-weight node |
| "You're ready. Stop and apply." | Forecast ≥ the user's chosen confidence |

### Recovery and change

- **Missed days:** no penalty language. On return, reroute with the
  remaining days, show the new ETA, and offer the smallest useful session
  (fresh-start framing, [S8]).
- **Deadline moved earlier:** triage. Drop low-weight nodes, focus on
  pass-critical ones, and say plainly what's being dropped.
- **Deadline moved later:** add depth and robustness, not more volume.
- **Unexpected life event:** one tap pauses the season; the forecast
  freezes; no streak exists to break.
- **Time budget consistently lower than stated:** after two weeks, the
  system proposes the true budget and an updated ETA instead of silently
  failing.
