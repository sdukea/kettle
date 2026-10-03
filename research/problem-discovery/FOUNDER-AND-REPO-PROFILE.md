# Founder and Repository Profile

An honest read of what has been built, written to choose an opportunity the
builder can actually win. It is meant to be useful rather than flattering.
Evidence: [R1, R2 in SOURCES](../SOURCES.md#g-founder-repository-evidence-first-party).

---

## 1. What exists

### This repository (`sdukea/nue`)

| Observation | Evidence |
|---|---|
| 37 commits over 8 days (2026-09-25 → 10-02). | `git log` |
| The project pivoted once. A real-time voice-translation app (FastAPI + LiveKit + React, ~2,900 lines) landed 2026-09-28 and was deleted the next day ("start fresh"). | commits `fafe07c`, `ca982d4` |
| It is now a design-complete, code-empty LeetCode learning-record product: 12 design docs, 6 ADRs and 1 spike (~3,000 lines), plus a tooling baseline (pnpm, TypeScript 7, Biome, CI). | `docs/`, commit `65d9ae8` |
| The design quality is high. Observed and inferred claims are separated (ADR 0004), capture is minimised and justified per signal, there are explicit phase gates with kill criteria (V0 criterion 4), and a "what not to build" list. | `docs/03-mvp.md`, `docs/12-risks-and-first-task.md` |
| One real empirical step has been taken: Spike 001 probed LeetCode's Monaco editor live. | `docs/spikes/001-leetcode-editor-probe.md` |
| The GitHub repo description still says "Real-time voice translation for calls." | GitHub profile |
| Most commits carry `Co-Authored-By: Claude`. | `git log` |

### Other public work (39 repos)

| Repo | What it shows |
|---|---|
| **mark**: Chrome extension that fills faculty marks into ESPro from Excel | Has **a real user group** (faculty). Adapter pattern isolating DOM knowledge, safety-first verification, 45 tests, local-only data. It is the most *product-shaped* work in the portfolio. |
| **fay-winner**: hackathon emergency-dispatch optimizer | Deterministic core (Hungarian algorithm) with the LLM limited to explanations. Next.js, Prisma, Vitest. Built under time pressure. |
| **within**: Postgres knowledge DB with full-text, pgvector and RRF hybrid retrieval | Database and retrieval fundamentals, raw SQL, and deliberate "DB primitives first, LLM second" framing. |
| **kite**: in-memory Unix-like filesystem in C with persistence | Systems fundamentals and tests, but built from a provided guide (`Guide.pdf`). |
| **next-v1**, **video-feed-ranking**, **supervised-MLS**, **rill** | Recommendation and ranking interest, ML basics. `rill` is 12 commits and early. `next-v1` ships an `all-Next.pdf` spec. |
| 2023 repos (todo apps, hotel booking, weather API, PDF converter…) | Course-style beginner projects. They are fine as history but dilute the profile if pinned. |

---

## 2. Recurring themes

These patterns repeat often enough to call them real interests:

1. **A deterministic core with an LLM at the edge.** It appears in fay ("math
   decides, Gemini explains"), within ("database primitives, then LLM"), and
   Nue (ADR 0004: "facts computed, not generated"). This is the builder's
   clearest *point of view*, and a good one.
2. **Browser extensions over someone else's web app, using an adapter.** mark
   (ESPro) and Nue (LeetCode). The builder is comfortable with MV3, content
   scripts, and isolating platform-specific knowledge.
3. **Safety, verification and privacy as design drivers.** mark verifies every
   write. Nue limits capture to one URL pattern and refuses keystrokes.
4. **Ranking and recommendation.** next-v1 and video-feed-ranking. This is
   unused in Nue so far, but relevant to any "what should I review or solve
   next" product.
5. **Tools for the builder's own world:** students and faculty (mark), interview
   prep (Nue). Founder-market fit is real here: the builder *is* the user.

---

## 3. Critique

### Weaknesses

- **Zero external users anywhere.** Every repo has 0 stars, 0 forks and 0
  issues. mark is the only one with a plausible real user, and that isn't
  documented. **The single biggest gap in the portfolio is not technical. It is
  that nothing has been used by strangers.** A FAANG reviewer will discount
  any number of architecture docs next to "40 people used this weekly".
- **Breadth over finish.** In roughly 2026-07 → 2026-10 there are 8+ new
  projects. Several are early-stage (rill), guide-driven (kite, next-v1), or
  abandoned within 24 hours (the voice app). The pattern is *start → design →
  move on*.
- **Nue has more design than evidence.** 3,000 lines of design rest on an
  untested thesis ("an auto-reconstructed record beats your own notes").
  V0 was correctly designed to test that, but no session has been captured yet.
  The docs are good enough to make the idea *feel* validated when it isn't.
- **Heavy AI co-authorship.** That's a legitimate way to work in 2026. The
  risk is the one this research found in learners generally
  ([S01](../SOURCES.md), [S04](../SOURCES.md)): an interviewer asks "why
  pg-boss over BullMQ?" or "walk me through the revision compactor", and the
  answer must come from the builder, not the docs. **The builder must be able to
  defend every ADR without the repo open.**
- **Portfolio coherence.** Pinned repos currently read as "many ML and infra
  sketches". There is no single deep, used, maintained thing.
- **Stale signals.** The GitHub description of `nue` is wrong. The README
  tagline "LeetCode's never been this easy" contradicts the product principle
  ("observe, don't assist"; struggle is the signal).

### Strengths

- **Taste in problem framing.** The Nue docs reason from the output backwards
  ("start from the output, not the input"), define kill criteria before
  building, and separate observation from inference. That is rarer than
  coding skill.
- **The right technical instincts:** a modular monolith over microservices,
  Postgres-backed queue over Redis, no vector DB without a retrieval problem, no
  agent frameworks. These are senior-sounding choices.
- **Real fundamentals across layers:** C (kite), SQL and retrieval (within),
  optimization algorithms (fay), extension internals (mark, Nue spike), and
  ranking (next-v1).
- **Speed.** The builder can stand up a credible system in days.

---

## 4. Engineering level (estimate)

| Dimension | Estimate | Why |
|---|---|---|
| Coding fundamentals | Solid student / strong intern | C, Python, TS, SQL across real projects with tests |
| System design *on paper* | Above level | The Nue docs are mid-level-engineer quality |
| System design *proven in running code* | Unproven | No deployed, used, operated system |
| Product judgment | Good instincts, untested | Kill criteria are present, but no real users to judge against |
| Finishing and operating | **The weakest area** | Many starts, few shipped and maintained |
| ML engineering | Coursework-plus | Ranking pipelines, vectorized ML, no production ML |

**One-line profile:** a fast, broad, design-literate student engineer
who hasn't yet shipped one thing that strangers use, then operated it through
contact with reality.

---

## 5. What this means for choosing an opportunity

1. **Prefer opportunities where the first 10 users are physically reachable**
   (classmates, juniors, faculty in Bangalore). Distribution is the weakest
   muscle, and proximity compensates for it.
2. **Prefer opportunities that reuse existing assets:** the extension and
   adapter skill, the deterministic-core and LLM-edge pattern, and the Nue
   capture design, *provided* the opportunity is chosen on evidence, not
   sunk cost ([DECISION-LOG D4](../decisions/DECISION-LOG.md)).
3. **Choose something small enough to ship in 3–4 weeks and run for a whole
   semester or placement season.** The portfolio needs *one* long-lived, used,
   instrumented system more than another design.
4. **The stretch should be operational, not architectural:** real users,
   on-call for your own bugs, measured retention, and changing course on data.
   That is the missing evidence for a FAANG reviewer.

---

## 6. Housekeeping (independent of which idea is chosen)

- Fix the `nue` GitHub description.
- Reconsider the README tagline, which contradicts the product principle.
- Pin 4 repos that tell one story, and archive the 2023 course projects.
