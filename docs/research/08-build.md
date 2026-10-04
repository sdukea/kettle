# 08 · MVP stages and the 10x version

*Phases 17 and 18. A tiny founding team (one to two people) is assumed.*

## What the MVP must prove

Not "people like generating roadmaps." It must prove:
1. People **will be measured** when it's framed as skipping (it beats the
   avoidance loop).
2. The position fix is **believed and accurate** (users agree; later
   probes confirm it).
3. Users **advance measurably faster** than in their own prior weeks.
4. Readiness **predicts real outcomes** better than self-assessment.

## MVP v0: concierge (weeks 1–3)

- **Features:** none in code. Google Form intake; a curated set of about
  40 problems tagged to about 30 skill nodes; a scoring rubric for
  explanations; a spreadsheet learner model; WhatsApp/Discord messages for
  "Now".
- **Flow:** intake → a 30-minute live position fix over a call → a written
  skip list, gaps and ETA → daily "Now" message → weekly re-probe → ask for
  the outcome.
- **Users:** 15–20 students with real dates.
- **Data:** probe results, time spent, self-confidence before each probe,
  outcomes.
- **Kill or continue (decide by end of week 3):**
  - ≥50% complete the first position fix, **and**
  - ≥30% complete the second weekly re-probe, **and**
  - ≥5 say they'd pay for the rest of the season at a stated price (ask
    for a pre-payment, not opinions).
  - If it fails, check first whether it was the *framing* (avoidance) or
    the *value* (accuracy). Then pivot or kill.
- **Don't build:** any software.

## MVP v1: one-domain web app (weeks 4–14)

- **Features:** goal intake; arrival-test templates (3 destinations: OA
  for internships, new-grad SWE loop, campus placement test); probe bank
  of about 300 items over about 150 nodes; in-browser code runner;
  explain-aloud probe (speech-to-text plus rubric grading); bug-find probe;
  learner model; route solver; "Now" with 10/25/60; weekly re-probe;
  readiness range (labelled uncalibrated); skip list; outcome report;
  season pause; payments.
- **Architecture:** a modular monolith (TypeScript or Python), Postgres
  (graph as tables, responses, model state), a queue for grading jobs, a
  sandboxed code-runner service, one LLM provider behind an interface for
  item generation and rubric grading, and a classical learner model in
  plain code (BKT/IRT to start).
- **AI requirements:** item generation with automated verification; rubric
  grading with self-reported uncertainty; arrival-test compilation from
  templates. No agents, no fine-tuning.
- **Data requirements:** every response (correct, time, hints none),
  confidence ratings, sessions, outcomes. Consent screens in plain
  language.
- **Don't build:** chat home, mobile app, calendar sync, social, content,
  a second domain, gamification.

## V2 (months 4–9)

- **Features:** peer probes; cohort seasons; published arrival tests
  (authored by passers); plateau detection; what-if planner; evidence
  import; goal chaining; AI voice mock probe; calendar *suggestions*.
- **Architecture:** IRT recalibration jobs; forecast calibration pipeline;
  author tools.
- **Data:** first calibration report on internal outcomes.
- **Don't build:** B2B dashboards yet, other domains, marketplace.

## V3 (months 9–24)

- **Features:** second and third destinations on a shared graph (data
  analyst, ML engineer, system design); B2B2C cohort view with
  student-controlled sharing; arrival guarantee (if calibration is good);
  public calibration report; graph-authoring tools for experts; position
  API (private beta).
- **Don't build:** "any goal" intake (until the authoring tools make a new
  domain cheap), a life OS, a recruiter product.

## Phase 18: the 10x version

Assume 100M users, years of position→outcome data, calendars, browsers,
documents, wearables and learning platforms connected (all with consent).

**What it becomes:** a **position layer for human capability**, not a life
OS.

- **Ambient position.** Measurement mostly comes from real work: code you
  write, documents you produce, languages you speak, runs you log. It
  measures *unaided* performance where possible, and explicit probes become
  rare.
- **A forecast for any testable goal.** "People with your position and
  pace who started this route reached it in 9–14 weeks; 70% passed." It's
  calibrated across millions of journeys and published openly.
- **Universal reroute.** Life events from the calendar trigger replanning
  across all active goals, with honest trade-offs ("the move costs the
  French goal three weeks; keep it or defer it?").
- **A portable, user-owned capability record.** Individuals hold their
  verified position; they choose to show it to schools and employers.
  [S] This could replace part of what transcripts and resumes do badly.
- **Position as infrastructure.** Every learning product queries "where is
  this learner?" and "are they ready?", the way apps query Maps for
  location.

**What it should refuse to become:** an agent that does the work for you
in domains where the work *is* the growth; an engagement machine; or a
scoring system that institutions use on people without their control.
