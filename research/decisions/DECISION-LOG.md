# Decision Log

Each entry records what was decided, why, what was rejected, and what would
reverse it. Newest entries go at the bottom. Product and architecture decisions
that are hard to reverse go in [docs/adr](../../docs/adr/README.md). This log
is for research and strategy.

---

### D1: Research before building, even though Nue's design is complete (2026-10-03)

- **Context:** `docs/` holds a full design for Nue, but no user has validated
  its thesis, and V0 hasn't run.
- **Decision:** pause the Phase 1 capture spike. First do problem discovery
  across the wider population of early-career engineers, and treat Nue as *one
  candidate* rather than the default.
- **Why:** the design docs are persuasive enough to feel like validation.
  The cheapest moment to change direction is before code exists.
- **Reverses if:** the user selects Nue (Opportunity 1). The capture spike
  then resumes as planned, with the additions in TOP-5 §1.7.

### D2: Reddit was inaccessible; substitute sources and flag the gap (2026-10-03)

- **Context:** web search and browser access to reddit.com were both
  blocked in this research environment.
- **Decision:** use HN (Algolia API), Blind, Codeforces blogs, GitHub, store
  listings and academic work. Mark first-person learner evidence as
  under-sampled. Make a manual Reddit pass the first step of validation.
- **Consequence:** pains voiced mainly by learners (A4, G1) may be
  *under*-evidenced, and pains voiced by seniors about juniors may be
  *over*-represented.

### D3: Treat install counts as a demand signal, with caveats (2026-10-03)

- **Decision:** the contrast between retention extensions (~10–600 users
  [S26]) and GitHub-sync extensions (~60k [S28]) is treated as meaningful
  evidence that **visibility drives adoption more than private learning value
  does**.
- **Caveats:** installs ≠ use. LeetHub is older and benefited from GitHub
  trending. Retention tools may simply be poorly built or poorly distributed.
- **Reverses if:** Reddit or interviews show retention tools are abandoned for
  fixable UX reasons rather than lack of need.

### D4: Watch for anchoring on the existing capture architecture (2026-10-03)

- **Observation:** three of the five survivors (Nue, Viva, Proof) reuse the
  process-capture design, and two more reuse the "deterministic core with
  evidence-checked LLM" pattern.
- **Decision:** keep them, because the gaps they address were evidenced
  independently (MARKET-MAP §1.1, §1.4, §1.5). Discount their Fit scores,
  though, and require each to pass the same validation bar as the others.
- **Reverses if:** validation shows the reused asset isn't what users value.

### D5: Eliminate the AI-enabled interview simulator despite high urgency (2026-10-03)

- **Context:** at first it looked like the strongest candidate (a new format
  [S14], paying users, urgency).
- **Decision:** eliminated. AlgoMonster, interviewing.io and others shipped
  practice for the format within about a year [S31], with distribution a
  student founder can't match.
- **Lesson recorded:** a new, urgent problem attracts incumbents just as fast.
  Prefer gaps where incumbents are structurally absent (instructors, review
  practice) over gaps that are merely new.

### D6: Present five options without choosing one (2026-10-03)

- **Decision:** per the brief, TOP-5 lays out evidence and tradeoffs and
  explicitly does not recommend one.
- **Pending:** **the founder's choice of opportunity.** The next entry here
  should record that choice, the reasoning, and the validation start date.

### D7: Founder chose Opportunity 1, Nue (2026-10-04)

- **Decision:** pursue Nue, re-targeted by the research: placement-season
  sheet grinders in Bangalore, cold re-solves as the core review loop, and an
  opt-in public card of observed facts as the adoption mechanism.
- **What carries over from the research:** the binding kill criteria in
  [TOP-5 §1.15](../opportunities/TOP-5.md), and the risk that retention tools
  don't spread [S26], which is now the main thing Beta-0 must disprove.
- **Next:** [docs/13 — Product spec](../../docs/13-product-spec.md) and
  [docs/14 — Engineering roadmap](../../docs/14-engineering-roadmap.md). The
  Reddit pass and problem interviews run in parallel with the capture spike,
  before any product code beyond the spike.
