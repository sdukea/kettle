# Market Map and Competitor Analysis

For each problem: **how is it solved today?** and **why isn't that good
enough?** Source IDs refer to [SOURCES.md](../SOURCES.md). Competitor facts
come from product pages and store listings as of 2026-10-03. User counts are
Chrome Web Store installs, which are a rough proxy for use.

---

## 1. Problem → current solutions → gap

### 1.1 Retaining and transferring DSA skill (A1, A2)

| Solution | Type | What it does | Why it isn't enough |
|---|---|---|---|
| LeetCode (submissions, notes, lists) | Platform | Keeps final accepted code and a notes field. | It records answers, not how you got there, and has no review loop. |
| NeetCode 150 / Striver A2Z / Grind 75 | Curated lists, ~$100/yr tiers [S30, S34] | Structure: *what* to solve, in order. | The same list for everyone. No memory of *your* mistakes. Re-solving is manual. |
| Spreadsheet / Notion tracker | Ad hoc | "Problem · date · confidence · revisit on" | 5–15 minutes per problem, so it's abandoned in a few weeks (stated in Nue docs, consistent with S24). |
| Anki | General SRS | Flashcards. | Card-making is costly. It trains recall of specific problems, not transfer [S24]. |
| LeetRecur, LeetSRS, LeetSpacer, LeetRepeat, Lanki, "LeetCode Spaced Repetition" | Extensions | Schedule re-solves, sometimes FSRS, sometimes notes. | **~10–600 users each [S26].** They schedule *when*, but not *what you got wrong*. Self-rated confidence is unreliable [S02]. |
| LeetCopilot | Extension (AI) | Hints, auto-notes, mistake tracking, mocks [S27]. | It **helps while solving**, which contaminates the signal and trains dependence [S01]. 723 users. |
| LeetHub v2 / 3.0 | Extension | Pushes accepted code to GitHub. | Solves *visibility*, not learning, and that is why it has ~60k users [S28]. |
| ChatGPT / Claude ("explain this solution") | General AI | Explains *the* solution on request. | Someone else's reasoning. The fluency illusion: it feels understood but isn't retrieved [S06]. |

**Absence analysis:** no product reconstructs the *process* (deleted
approaches, failing runs, the turning point) and feeds it into review.
Which of the six reasons for absence applies?

- *Nobody solved it:* partly. Capture is technically awkward (Monaco hooks,
  undocumented endpoints).
- *Nobody wants it:* **the main risk.** Adjacent retention tools stall
  [S26].
- *Can't monetize:* partly. The prep market pays ~$100/yr for content [S30],
  but tracking tools are free.
- **Most likely: people solve it manually or don't solve it**, because
  re-solving lists is "good enough" and the pain peaks only right before an
  interview.

### 1.2 Understanding code you shipped with AI (G1, A4)

| Solution | What it does | Gap |
|---|---|---|
| ChatGPT study mode, Gemini Guided Learning, Claude learning modes [S39] | Socratic tutoring in chat. | Session-local. Doesn't know what you shipped. Nothing persists or measures over time. |
| Claude Code / Cursor "explain" | Explains a diff on request. | Passive. Explanations read are not retrieval [S06]. |
| Code review tools (CodeRabbit, Copilot review) | Review the *code*. | They measure the code's quality, not the *human's* understanding of it. |
| Engineering analytics (Faros etc.) [S05] | Team-level metrics, now discussing "comprehension debt". | Built for managers, and team-level, which is surveillance-adjacent for individuals. |
| University oral exams [S20] | A human asks you to explain your code. | Works, but costs instructor time and is rare. |

**Absence analysis:** *nobody solved it*, plus *the market is new*. The term
"comprehension debt" only entered practitioner vocabulary in 2025–26 [S04,
S05]. The risk is that individuals don't feel the pain enough to adopt a tool
voluntarily (see [PSYCHOLOGY §3](../psychology/PSYCHOLOGY.md)).

### 1.3 Learning to verify and review code (G2)

| Solution | What it does | Gap |
|---|---|---|
| BugHunt [S38] | Free in-browser single-bug drills in toy code (Python/JS). | Toy scale. One obvious bug. No codebase context, which is not what reviewing an AI PR is like. |
| BugSpotter (research) [S38] | LLM-generated buggy code for CS1. | Research prototype, novice scale. |
| Codecademy debugging course | Error types. | Introductory. |
| Real code review at work | The actual apprenticeship. | Requires a job, the thing juniors can't get [S13], and senior reviewers' time. |
| Defects4J, BugsInPy, SWE-bench | Real, reproducible bug datasets for *research and AI evaluation*. | Not packaged for human learners. **This is the unused asset.** |

**Absence analysis:** *nobody solved it for humans*, because the
infrastructure (containerized repro of real bugs, grading) is technically
heavy and education buyers pay little. The datasets exist because AI labs need
them, and humans haven't been the customer.

### 1.4 Instructors seeing understanding (M1)

| Solution | What it does | Gap |
|---|---|---|
| CodeHS, Codio, zyBooks code replay; PISA Editor [S21] | Keystroke replay and paste detection inside their platforms. | Shows *how code arrived*, not *whether the student understands it*. Locked to the platform. Framed as integrity (adversarial). |
| MOSS, Codequiry, AI detectors | Similarity and "AI-written" detection. | Unreliable against AI, and adversarial. |
| Manual oral exams [S20] | A human checks understanding. | Doesn't scale. Instructors pay in hours. |
| NYU "Viva" research system [S11] | A voice-AI oral exam with an LLM grading council. | Research. General questions, not grounded in the student's own code history. |
| Gradescope, autograders | Correctness. | Correctness is now cheap to fake. |

**Absence analysis:** *the problem is new (2024+) and institutions move
slowly.* The buyer is an instructor, department or university, which means
slow sales but sticky adoption once a course uses it.

### 1.5 Proving ability to employers (A5, K, L2)

| Solution | What it does | Gap |
|---|---|---|
| GitHub profile / green squares | Visible activity. | Trivially gamed, and now AI-generated [S17]. |
| LeetHub [S28] | LeetCode → GitHub. | Displays code, not ability. Code could be pasted. |
| LeetCode / Codeforces ratings | Rated contests. | AI cheating erodes the signal [S16]. |
| Certifications, HackerRank badges | Proctored-ish tests. | Low hiring signal. |
| Portfolio projects | Built things. | Indistinguishable from generated templates without iteration history [S17]. |

**Absence analysis:** *the problem is technically difficult* (verifiable
provenance is hard; anything client-side can be faked) **and** *two-sided*
(an employer must trust the proof). Strong pain, but a hard business.

### 1.6 Other problems mapped, then dropped

| Problem | Why it's well served (or not a product) |
|---|---|
| Codebase onboarding | DeepWiki (free, any public repo), Greptile, Sourcegraph [S36]. The employer is the buyer. |
| Interview anxiety / mocks | Exponent/Pramp, interviewing.io ($179+), dozens of AI mock tools [S30]. |
| AI-enabled interview prep | AlgoMonster (rubric-scored AI mock in a codebase), interviewing.io, Prepfully, PracHub, HelloInterview [S31]. Served within a year of the format change. |
| CP plateau analysis | Six or more free recommenders [S32]. |
| What to learn next | roadmap.sh, curated sheets. |
| "AI tutor that doesn't give answers" | All three frontier labs [S39]. |
| OSS first contribution | goodfirstissue-style sites. The real barrier is maintainer trust [S10, S37]. |

---

## 2. Competitive landscape at a glance

```
                     helps WHILE solving            observes / measures AFTER
                  ┌──────────────────────────┬────────────────────────────────┐
 personal,        │ LeetCopilot, ChatGPT/     │ SRS extensions (stalled ~500)  │
 single user      │ Gemini/Claude study modes │ Nue (designed, unbuilt)        │
                  │ Cursor/Claude Code        │ ── "comprehension" gap ──      │
                  ├──────────────────────────┼────────────────────────────────┤
 visible to       │ (Cluely: cheating) [S15]  │ LeetHub (~60k) [S28]           │
 others           │                           │ CodeHS/Codio replay [S21]      │
                  │                           │ ── "verified process" gap ──   │
                  └──────────────────────────┴────────────────────────────────┘
```

The top-left is crowded and commoditized by the frontier labs. The
right-hand column is where this research finds gaps. Adoption evidence there
favors the **bottom** row (visible to others) over the **top** row (private)
[S26 vs S28].

---

## 3. Takeaways for opportunity selection

1. **Don't compete on "AI that helps you learn" in chat.** That is the frontier
   labs' feature [S39].
2. **Private self-improvement tools for DSA don't spread** [S26]. Any
   retention play needs an adoption mechanism the others lacked, not just a
   better scheduler.
3. **Visibility drives adoption** [S28]. But visible claims need to be
   trustworthy to be worth anything [S16, S17], which is a hard technical
   problem and therefore a moat if solved.
4. **Verification and comprehension are the new junior skills** [S01, S18], and
   the only tools are toy drills or team analytics. This is the clearest
   white space.
5. **Instructors are a reachable, motivated buyer** with a new (2024+) problem
   and only replay-based tools. Sales are slow, but there is a natural cohort
   of 30–200 users per course.
6. **The builder's assets** (process capture, deterministic analysis with
   cited LLM claims, extensions) map onto gaps 1.1, 1.2, 1.4 and 1.5.
   *Watch for anchoring on these assets* ([DECISION-LOG D4](../decisions/DECISION-LOG.md)).
