# User Problems: What the Next Generation of Engineers Actually Struggles With

This document starts from people, not products. For each segment, it lists the
pains the brief proposed and checks each one against evidence. Every pain is
split into:

- **Observation:** what sources show (IDs refer to [SOURCES.md](../SOURCES.md)).
- **Interpretation:** what we think it means.
- **Hypothesis:** what we would need to test.
- **Evidence:** 🟢 strong (multiple independent primary sources) ·
  🟡 moderate (one primary source, or several secondary ones) · 🔴 weak
  (anecdote or inference only).

> Limitation: no Reddit access (see [SOURCES](../SOURCES.md)). First-person
> student voices are under-represented. Many "junior" pains below are
> reported by **seniors and teachers about juniors**, not by juniors
> themselves. That asymmetry matters and is flagged where it applies.

---

## 0. The context that changed in 2025–26

Four shifts frame every problem below. They are the reason these problems are
different from the 2019 versions.

| Shift | Evidence | Why it matters |
|---|---|---|
| The entry rung is shrinking | Employment of developers aged 22–25 is down ~20% from its 2022 peak [S13]. CS and CE recent-grad unemployment is ~7.0% and ~7.8% [S12]. | The fear is rational. The bar for "hireable junior" is rising. |
| AI writes code that learners can't evaluate | AI use lowered unassisted comprehension by ~17 points in an RCT [S01]. Weaker students end with an illusion of competence [S02]. 66% of developers say AI is "almost right" [S18]. | Output no longer proves skill, to others *or to yourself*. |
| Signals of ability are degrading | ~4% of top Codeforces ranks were AI cheaters in one round [S16]. Interview cheating is reported widely [S15]. Homework near 100% while exam scores fall [S19]. | Every credential that used to separate "can" from "can't" is noisier. |
| Formats are adapting | Meta's AI-enabled coding round is going to all SWE roles in 2026 [S14]. Oral code explanations are returning in universities [S20]. GitHub added PR restrictions against AI slop [S37]. | Institutions are moving toward **"explain and verify, under observation"**. |

**The synthesis this research keeps returning to:**
> In 2026 the scarce thing for a learner is not information or practice
> problems. It is **trustworthy evidence of what they can actually do
> unaided**: evidence for themselves (am I improving?) and for others
> (can I prove it?).

This is our interpretation, not a finding. The opportunities test it from
different angles.

---

## A–E. Students, self-taught learners, CS undergraduates, interview candidates

### A1. "I solved it, and two weeks later I can't solve it again." 🟢

- **Observation:** a long-running complaint on Blind (2020, 2023)
  [S22, S23], on HN [S24], and as a recurring blog genre [S25]. Workarounds are
  spreadsheets, Anki, and re-solving curated lists. Anki works for some people
  and fails for others [S24]. Retrieval beats re-reading [S06].
- **Interpretation:** the pain is real and frequent. What people mean by
  "remember" is usually **transfer**: recognizing the pattern in a *new*
  problem, not recalling the old one.
- **Counter-evidence:** at least five dedicated retention extensions each sit
  at roughly 10–600 users [S26], while GitHub-sync extensions sit at
  10k–50k [S28]. **The pain is widely felt, but tools that solve it don't
  spread.**
- **Hypothesis:** retention tools fail because (a) they require effort
  after solving, at exactly the moment the person wants to move on, and (b) they
  produce private value nobody sees. *To test.*

### A2. "I can't tell whether I'm actually getting better." 🟡

- **Observation:** advice threads tell people to "focus on patterns", "be
  consistent" and "upsolve" [S22, S23, S33], which is generic advice for a
  measurement problem. Struggling novices misjudge their own performance
  [S02].
- **Interpretation:** solved-count is the only metric most people have, and it
  measures volume, not skill. There is no feedback signal for *how* you
  solved.
- **Hypothesis:** a trustworthy, per-person measure of improvement (e.g. time
  to the key insight on comparable problems, unaided re-solve success) would
  be valued. *Weakly evidenced as a stated want; strongly implied by
  behavior.*

### A3. "I'm in tutorial hell; I can't build anything on my own." 🟡

- **Observation:** a widespread genre with dozens of posts [search results in
  the brief's survey]. Advice converges on "build projects".
- **Interpretation:** this is the pre-AI form of what AI now amplifies.
  Following a tutorial and prompting an agent are both "outputs without
  ownership".
- **Market:** heavily served by content (roadmap.sh, freeCodeCamp,
  CodeCrafters). Not a wedge on its own.

### A4. "I use AI for everything and I'm scared I can't code without it." 🟡 (🟢 for the underlying effect)

- **Observation:** the effect is real [S01, S02, S04]. Learners are *less*
  positive about AI than professionals (53% vs 61%) [S18]. One HN learner says
  skipping the effort leaves them "no better than anyone" [S40]. A Blind thread
  is titled "worried about chatgpt dependency" (search result, not read in
  full).
- **Interpretation:** learners are not naive. They suspect the problem but
  have no instrument to measure it, and the honest measurement (an unaided test)
  is unpleasant.
- **Hypothesis:** learners want to *know* where they stand, but may avoid
  measurement because the result threatens their identity (see
  [PSYCHOLOGY](../psychology/PSYCHOLOGY.md) §4). **Avoidance is the main risk
  for any product here.**

### A5. "I'm afraid I'll graduate unemployable." 🟢

- **Observation:** labor data [S12, S13]. In India, placement season
  concentrates comparison and rejection into October–March, and college tier
  gates access [S35].
- **Interpretation:** this is the emotional engine behind every other prep pain.
  It also means willingness to try is high *during* the window and collapses
  after it.

### A6. "I freeze in interviews even though I know this." 🟢

- **Observation:** being watched more than halved performance in an RCT [S09].
  Human mock interviews cost $179+ per session [S30].
- **Interpretation:** real and expensive to address, but crowded (Pramp/
  Exponent, interviewing.io, dozens of AI mock tools). The pain is strong and
  the wedge is weak.

### A7. "The interview format is changing and I don't know how to prep for it." 🟡

- **Observation:** Meta's AI-enabled round [S14]. Incumbents shipped prep for it
  within months [S31].
- **Interpretation:** real and urgent for a narrow group (people with an
  upcoming loop). **Already being served.**

---

## F. AI/ML learners

### F1. "I've done courses but can't implement or reason about models myself." 🔴

- **Observation:** only secondary material was found (blogs). ML instructors
  report that design decisions are harder to teach than algorithms (ACM
  study surfaced in search, not read in full).
- **Interpretation:** plausible, but our evidence is thin and the space has
  practice platforms (Deep-ML, LeetGPU, Kaggle). Not pursued further in
  this pass. **Marked as a research gap.**

---

## G–H. Junior and early-career engineers

### G1. "I ship code I don't understand." 🟢 (as a phenomenon) / 🟡 (as a felt pain)

- **Observation:** comprehension debt is described in 621 student diaries
  [S04] and has entered practitioner vocabulary [S05]. Seniors observe juniors
  "not engaged with solutions" [S40]. 45% of developers lose significant time
  debugging AI code [S18].
- **Interpretation:** the phenomenon is documented. Whether juniors *feel*
  it as pain rather than relief is the open question. The diaries suggest that
  at least students in reflective settings do [S04].

### G2. "I can't verify AI output; it's almost right." 🟢

- **Observation:** 66% "almost right", 45% "debugging AI code takes longer"
  [S18]. Confidence in AI predicts less critical thinking [S03].
- **Interpretation:** verification, meaning finding the subtle defect in
  plausible code, is becoming *the* core junior skill and it is not
  explicitly trained anywhere we found. Toy bug drills exist [S38]. Realistic
  review practice does not.

### G3. "Onboarding to a big codebase is overwhelming." 🟡

- **Observation:** juniors take 6–8 months to work unsupervised; walkthroughs
  and pairing help [S41].
- **Market:** DeepWiki and Greptile serve this for free or for teams [S36]. The
  buyer is the employer. **Not a student wedge.**

### G4. "I don't get feedback; nobody reviews my code." 🟡

- **Observation:** Exercism offers free volunteer mentoring (product page).
  Hiring commentary says explanation of your code matters [S17].
- **Market:** AI code review is everywhere (CodeRabbit, Copilot review,
  ChatGPT). Generic AI feedback is commoditized. *Trustworthy* feedback, meaning
  feedback tied to evidence of what you did, is less so.

---

## I. Open-source contributors

### I1. "I want to contribute but don't know how to start, and nobody responds." 🟢 (pre-AI) → worsening

- **Observation:** the barriers are mostly social and well documented [S10].
  Since 2025 agent PRs have quadrupled and GitHub lets maintainers disable or
  restrict PRs [S37].
- **Interpretation:** the newcomer path is getting *harder*, because unknown
  contributors are now presumed to be bots. This is a **trust** problem, not an
  information problem.
- **Assessment:** a real and growing pain, but solving it requires maintainers
  (the gatekeepers) to adopt something. That is a two-sided cold start. Kept
  as a candidate and scored low on accessibility.

## J. Hackathon builders

### J1. "Our hackathon projects die the day after." 🔴

- **Observation:** no strong evidence found that this is felt as pain rather
  than accepted as normal.
- **Interpretation:** this is "absence of competitors because nobody wants it"
  ([MARKET-MAP](../market-map/MARKET-MAP.md) §3). Dropped.

## K. People trying to become exceptional, not just employed

### K1. "I can't tell what separates me from a strong engineer." 🔴

- **Observation:** HN learner voices are rare. Most "become exceptional"
  content is aspirational writing, not complaints.
- **Interpretation:** a small, high-agency group that self-serves (books,
  CodeCrafters, OSS). Interesting as *early adopters* of any honest
  measurement tool, but not a market on its own.

## L. Competitive programmers

### L1. "I'm stuck at the same rating for months." 🟡

- **Observation:** plateau posts on Codeforces [S33]. The advice is known
  (upsolve, raise difficulty). There are at least six free weak-tag
  recommenders [S32].
- **Interpretation:** the bottleneck is discipline and deliberate practice,
  not information. The tool space is saturated with student-built analyzers,
  a cautionary pattern for this builder.

### L2. "AI cheaters make ratings meaningless." 🟡

- **Observation:** [S16].
- **Interpretation:** another face of the "proof of unaided ability" problem.
  The buyer is the platform (Codeforces), which is not reachable.

---

## M. Teachers (added: not in the brief, surfaced by evidence)

The research kept surfacing a group the brief didn't list: **people who
assess learners.**

### M1. "Homework says they can; the exam says they can't." 🟡

- **Observation:** [S19, S20]. Process replay with paste detection exists in
  CodeHS, Codio and zyBooks [S21]. AI oral exams are being prototyped [S11].
- **Interpretation:** instructors are paying a manual time cost (oral
  exams) to recover the signal. Replay shows *what* happened but not *whether
  the student understands*.
- **Why it matters here:** the builder already has a faculty-facing tool
  (mark), which suggests reachable first users.

---

## Summary: pains by evidence and tractability

| # | Pain | Evidence | Already well served? | Notes |
|---|---|---|---|---|
| A1 | LeetCode amnesia | 🟢 | Many tools, none spread | Demand for *tools* is weak (S26 vs S28) |
| A2 | Can't measure improvement | 🟡 | No | Implicit in behavior |
| A4 | AI dependence fear | 🟡/🟢 | Study modes (generic) [S39] | Avoidance risk |
| A5 | Unemployability fear | 🟢 | n/a (engine, not product) | Seasonal intensity |
| A6 | Interview anxiety | 🟢 | Yes (mocks) | Crowded |
| A7 | New AI interview format | 🟡 | Yes, as of 2026 [S31] | Closing window |
| G1 | Comprehension debt | 🟢/🟡 | No (as a learner tool) | Felt-pain unverified |
| G2 | Can't verify AI code | 🟢 | Toy drills only | Strong |
| G3 | Big-codebase onboarding | 🟡 | Yes [S36] | Employer buyer |
| I1 | OSS entry and trust | 🟢 | Partly | Two-sided |
| L1 | CP plateau | 🟡 | Saturated [S32] | Avoid |
| M1 | Instructors can't see understanding | 🟡 | Replay yes, understanding no | Reachable |
