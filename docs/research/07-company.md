# 07 · Wedge, business, moat, virality, metrics, history

*Phases 12–16 and 19.*

## Phase 12: the wedge

Scored 1–5. Pain, frequency, WTP (willingness to pay), retention (R),
word of mouth (WoM), and **position signal** (Pos: can we measure
cheaply?). Pos is weighted double because the thesis depends on it.

| Segment | Pain | Freq | WTP | R | WoM | Pos ×2 | Total | Notes |
|---|---|---|---|---|---|---|---|---|
| **Early-career engineers with a dated technical hiring event** | 5 | 5 | 4 | 3 | 5 | 5 (10) | **32** | External arrival test; code is auto-gradable; dense cohorts [S22, S23] |
| Competitive-exam aspirants (GATE, CAT, JEE…) | 5 | 5 | 4 | 4 | 4 | 4 (8) | 30 | Huge, but owned by content giants with their own mock tests; we'd be a feature |
| Career switchers (into tech or data) | 5 | 3 | 5 | 3 | 3 | 3 (6) | 25 | High WTP, but fuzzy arrival and long cycles |
| University students (courses) | 4 | 4 | 2 | 3 | 4 | 4 (8) | 25 | Low WTP; institutions own the arrival test |
| Experienced engineers (system design / promo) | 3 | 3 | 5 | 3 | 3 | 3 (6) | 23 | Good year-2 adjacency |
| Lifelong learners / hobbyists | 2 | 3 | 2 | 2 | 3 | 2 (4) | 16 | Low pain |
| Founders | 4 | 4 | 4 | 3 | 3 | 1 (2) | 20 | No arrival test; the portfolio-of-bets model fits |
| Creators | 3 | 4 | 3 | 3 | 4 | 2 (4) | 21 | Outcome is audience; mostly luck-driven |
| Fitness / weight | 4 | 5 | 3 | 3 | 3 | 5 (10) | 28 | Strong signal, but Runna/Strava and wearables own it |

**Recommendation:** early-career engineers preparing for a specific,
dated technical hiring event, starting with the India placement and
internship season (the founder's network, and dense cohorts), with US new
grads as a parallel channel.

**The first 100 users:** final- and pre-final-year CS/IT students at 3–5
colleges with a placement or OA date within 4–16 weeks, recruited through
placement groups and coding clubs, plus recent passers recruited to
author arrival tests.

## Phase 13: business model

| Model | Fit | Decision |
|---|---|---|
| Freemium | Strong: the position fix is the hook | **Yes** |
| Monthly subscription | Weak: seasonal need; guilt of unused months | No |
| **Season pass** (per goal, ~3 months) | Matches the job; honest | **Yes, primary** |
| Premium (human mocks, expert review) | Proven WTP [S23] | Later add-on |
| B2B2C (placement cells, bootcamps) | Strong, with student-controlled sharing | **Year 2** |
| Enterprise (L&D readiness) | Plausible; slow sales | Year 3+ |
| Coaching marketplace | Distracting; quality control | No (early) |
| Content marketplace | Wrong company | No |
| API (position as a service) | Long-term infrastructure | Year 3+ |
| Creator ecosystem (arrival tests) | Free, with attribution; possibly revenue share later | Year 2 |
| Ads, data sales, recruiter access | Destroys trust | **Never** |

**Free:** destination, arrival test, one full position fix, skip list,
static route.
**Paid:** continuous measurement, "Now", forecast, rerouting, mock probes,
and outcome-calibrated benchmarks once available.
**Recurring value:** goal chaining, cohort renewals, and new seasons every
year.

## Phase 14: moat

| Candidate moat | Strength | Why |
|---|---|---|
| UI / UX | Weak | Copyable in weeks |
| Prompting / planning algorithms | Weak | Copyable; the labs are better at prompting |
| Personal model per user | Medium | Switching cost; portable export lowers it on purpose (trust > lock-in) |
| Skill graph per domain | Medium | Takes months per domain; copyable with effort |
| **Calibrated probe bank** | Strong | Needs response data at scale to calibrate |
| **Outcome-calibrated readiness** | **Strongest** | Needs measured position → real outcome pairs; nobody collects both |
| Published arrival tests | Strong (network) | Each test attracts the next user with the same destination |
| Trust / brand ("it tells the truth") | Strong, slow | Structural: engagement-optimizing competitors can't say "stop" |
| Community | Medium | Peer probes and cohorts |

**Big-company check:** *Google/OpenAI/Anthropic* could build the flow;
they're unlikely to run per-domain psychometrics and chase outcome
reports. *Notion* lacks the measurement DNA. *LeetCode* has the item data
but profits from volume. *Coursera* has outcomes data in aggregate but
profits from completion. [I] Each incumbent has an incentive conflict with
saying "skip" or "stop". That conflict is the opening.

## Phase 15: virality

| Loop | Mechanism | Strength |
|---|---|---|
| Skip-list share | A specific, status-positive claim: "I can skip 60%" | High [H] |
| Peer probes | Running a friend's mock with a rubric brings them in as a user | High [H] |
| Published arrival tests | SEO plus a social object: "what passing X looked like" | High, slow [H] |
| Cohort seasons | Batchmates join a shared season | Medium-high [H] |
| Evidence-backed before/after | Credible success stories | Medium [H] |
| Placement-cell adoption | A top-down batch onboarding | Medium (B2B) |
| "Share your roadmap" | Nobody wants your roadmap | Weak |

The GitHub analogy that *does* hold: **fork an arrival test**, not a
roadmap. The test is the reusable unit of knowledge; the route is
personal.

## Phase 16: north star and metrics

- **North star:** Weekly Verified Advances (active goals with measured
  forward movement this week).
- **Activation:** position fix plus first session within 24 hours.
- **Retention:** week-2 re-probe completed; seasons chained.
- **Engagement (diagnostic only):** sessions per active goal per week.
- **Outcome:** arrival rate among reported outcomes; outcome-report rate.
- **Trust:** calibration (Brier score, reliability curve) of the forecast.
- **Revenue:** paid seasons per activated goal; B2B seats.

Deliberately **not** north stars: DAU, time spent, streak length, sessions.

## Phase 19: product history lessons

| Product | Behavior before | Friction removed | New mental model | Habit driver | Made obsolete |
|---|---|---|---|---|---|
| Google | Directories, guessing URLs | Finding | "Ask and get it" | Every question | Directories |
| Google Maps | Paper maps, asking strangers | Knowing where you are | "Follow the blue dot" | Every trip | Route planning |
| Uber | Calling or hailing | Uncertainty about arrival | "Watch it come to you" | Need-based | The taxi dispatch call |
| Amazon | Store trips | Search and fulfilment | "Everything, delivered" | Prime | Catalogues |
| Facebook / Instagram | Albums, letters | Sharing | "Your life as a feed" | Social reward | Photo albums |
| YouTube | TV schedules | Distribution | "Anyone can teach" | Recommendations | Many paid courses |
| Spotify | Buying albums | Ownership | "All music, instantly" | Daily listening | The MP3 collection |
| Duolingo | Classes, textbooks | Starting cost | "5 minutes a day" | Streaks | Phrasebook apps |
| Strava | Paper logs | Recording and comparison | "If it's not on Strava…" | Social proof of effort | The training diary |
| Notion | Docs plus wikis | Tool sprawl | "Build your own system" | Team docs | Wiki software |
| Slack | Email threads | Latency | "Channels" | Work | Internal email |
| WhatsApp | SMS costs | Cost | "Free messaging" | Social | SMS |
| GitHub | Emailing patches | Collaboration | "Fork it" | Work | Patch mailing lists |
| Wikipedia | Encyclopedias | Access | "Everyone edits" | Search-led | Encarta |

**Pattern [I]:** the products that changed behavior removed one
uncertainty that people had silently accepted as normal. For Maps, it was
not knowing where you are. For Uber, it was not knowing when the car
arrives.

**What this product could make obsolete:** the *roadmap-hunting ritual*
(searching "how to learn X roadmap", collecting courses, asking strangers
"am I ready?") and **guessing whether you're ready**. The accepted
uncertainty it removes is: *"I have no idea where I actually stand."*
