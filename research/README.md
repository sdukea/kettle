# Research: Problem Discovery for the Next Generation of Engineers

Before writing product code, we asked what early-career engineers actually
struggle with in 2026. Then we tried to break our own ideas.

**Status:** desk research complete. User validation not started. No
opportunity has been chosen yet ([DECISION-LOG D6](decisions/DECISION-LOG.md)).

## The short version

1. **The context changed.** Entry-level developer employment is down ~20% from
   its 2022 peak [S13]. AI help lowers what learners can do unaided [S01, S02].
   Credentials such as CP ratings, take-homes and portfolios are getting
   noisier [S15, S16, S17].
2. **The recurring underlying problem:** learners lack *trustworthy evidence
   of what they can actually do unaided*, both for themselves and for others.
   And they tend to avoid measuring it, because the answer threatens their
   identity ([PSYCHOLOGY](psychology/PSYCHOLOGY.md) §4).
3. **The most useful counter-evidence:** LeetCode retention tools stall at a
   few hundred users each [S26], while a tool that makes solved problems
   *visible* on GitHub has ~60k [S28]. Private learning value alone hasn't
   driven adoption.
4. **28 candidates were scored, and 5 survived**, each for a different
   reason: [TOP-5](opportunities/TOP-5.md).

| # | Opportunity | User |
|---|---|---|
| 1 | **Nue**: solve-trace learning records | Placement-season DSA grinders |
| 2 | **Ledger**: a comprehension ledger for AI-built code | Capstone teams using coding agents |
| 3 | **Catch**: a review gym built from real bugs | New grads who review AI code daily |
| 4 | **Viva**: process-grounded understanding checks | Programming-lab instructors |
| 5 | **Proof**: a verifiable build record | Off-campus job seekers |

## How to read this

| If you are… | Start with |
|---|---|
| A founder or investor | This page → [TOP-5](opportunities/TOP-5.md) (final section: evidence and tradeoffs) |
| A recruiter or engineer | [FOUNDER-AND-REPO-PROFILE](problem-discovery/FOUNDER-AND-REPO-PROFILE.md) → [OPPORTUNITY-MATRIX](opportunities/OPPORTUNITY-MATRIX.md) → [DECISION-LOG](decisions/DECISION-LOG.md) |
| A potential user | [USER-PROBLEMS](user-research/USER-PROBLEMS.md). Does this describe you? |
| A contributor | [VALIDATION-PLAN](validation/VALIDATION-PLAN.md): the next work is talking to people |
| A skeptic | [SOURCES](SOURCES.md) (every claim, typed and confidence-rated) and D2–D4 in the decision log |

## Documents

| Doc | Contents |
|---|---|
| [SOURCES](SOURCES.md) | Ledger of 41 sources: what each says, what we infer, confidence |
| [problem-discovery/FOUNDER-AND-REPO-PROFILE](problem-discovery/FOUNDER-AND-REPO-PROFILE.md) | A candid critique of this repo and the builder's portfolio |
| [user-research/USER-PROBLEMS](user-research/USER-PROBLEMS.md) | Pains by segment, each graded, with observation / interpretation / hypothesis |
| [psychology/PSYCHOLOGY](psychology/PSYCHOLOGY.md) | Surface → behavioral → emotional → identity → economic layers, and the avoidance loop |
| [market-map/MARKET-MAP](market-map/MARKET-MAP.md) | How each problem is solved today, why that falls short, and why competitors are missing |
| [opportunities/OPPORTUNITY-MATRIX](opportunities/OPPORTUNITY-MATRIX.md) | 28 candidates, scored, with 23 eliminated and the reasons |
| [opportunities/TOP-5](opportunities/TOP-5.md) | Five opportunities in depth, including kill criteria |
| [validation/VALIDATION-PLAN](validation/VALIDATION-PLAN.md) | Interviews, concierge tests, metrics, timeline |
| [decisions/DECISION-LOG](decisions/DECISION-LOG.md) | Research decisions, biases, and the pending choice |

## Method and limits

- **Sources:** peer-reviewed and preprint studies, official surveys and
  statistics, first-person posts (HN, Blind, Codeforces), product listings,
  and secondary journalism. Each is typed in SOURCES, and vendor content is
  flagged.
- **Separation:** every document keeps *observation* (sourced), *interpretation*
  (ours) and *hypothesis* (to test) apart.
- **Known gaps:** no Reddit access (D2). No user interviews yet. Market-size
  figures come from secondary sources. Indian-context claims (lab vivas,
  college training budgets) are marked as inference.
- **Scoring:** the scores are ordinal judgments meant to make disagreements
  specific. They don't compute a winner.
