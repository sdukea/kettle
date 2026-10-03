# The Top 5 Opportunities

These five survived the elimination in
[OPPORTUNITY-MATRIX](OPPORTUNITY-MATRIX.md). They are deliberately different:
different users, different buyers, different core skills.

| # | Name | One-line user | Core question |
|---|---|---|---|
| 1 | **Nue**: solve-trace learning records | Placement-season students grinding a DSA sheet on LeetCode | Can I keep and *prove* what I solved? |
| 2 | **Ledger**: a comprehension ledger for AI-built code | Final-year students building capstones with coding agents | Do I understand what I shipped? |
| 3 | **Catch**: a review gym built from real bugs | Students and new grads who use AI daily but were never taught to review | Can I spot the defect in plausible code? |
| 4 | **Viva**: process-grounded understanding checks | Programming-lab instructors with 60–120 students | Which students understand the code they submitted? |
| 5 | **Proof**: a verifiable build record | Off-campus job seekers whose portfolios look AI-generated | Can I show *how* I built it, credibly? |

Conventions: `[Sxx]` are sources in [SOURCES](../SOURCES.md). **Inference**
marks our reasoning, not a sourced fact. Each opportunity follows the brief's
15 sections.

---

# Opportunity 1: Nue (solve-trace learning records)

## 1. Name
**Nue.** The current repo's direction, re-targeted by this research.

## 2. The exact user
**Third-year B.Tech/BE CSE students in Bangalore during placement season
(Aug–Mar) who follow a fixed DSA sheet (Striver A2Z [S34] or NeetCode 150) on
LeetCode, solve 10+ problems a week, and have an online assessment or
interview within 8 weeks.**

The first 10–100: the builder's own batch and the batch below, the college's
coding club, and two or three nearby colleges' placement WhatsApp groups.

## 3. The pain
They solve a problem and fail to re-solve it weeks later [S22, S23]. They track
progress by solved-count, which overstates ability. Workarounds (spreadsheets,
Anki) cost time and get abandoned [S24].

## 4. The deeper psychology
Re-solving risks discovering that the count is inflated, so they keep solving
*new* problems (identity-safe) instead
([PSYCHOLOGY §1, §4](../psychology/PSYCHOLOGY.md)). The fear underneath is:
*"I'm a memorizer, not a problem-solver, and placement week will expose it in
front of my batch"* [S35].

## 5. The current workaround
A sheet, plus LeetCode's submission history, plus occasional re-solves of
starred problems, plus watching a video the night before.

## 6. Why current software fails
- Spaced-repetition extensions schedule *when* but not *what you got wrong*, and
  rely on self-rated confidence, which is unreliable for exactly these users
  [S02, S26].
- LeetCopilot helps *during* the solve, which contaminates the signal and
  weakens learning [S01, S27].
- Nothing captures *process* (abandoned approaches, failing runs, the turning
  point).
- **Nothing makes honest effort visible.** LeetHub shows the code, but pasted
  code looks identical [S28].

## 7. The product
The existing [V0/V1 design](../../docs/03-mvp.md), with three changes this
research motivates:

1. **Retrieval, not re-reading [S06].** The core review action is a *cold
   re-solve* of your own past problem. Afterwards Nue diffs the two traces:
   time to the key insight, whether you repeated the same mistake, and
   whether you went straight to the right approach. The output is
   **evidence of growth against yourself**, which addresses the identity risk.
2. **Sheet-native.** Import a sheet (A2Z or NeetCode 150) as the problem universe,
   so "coverage" and "retention" are measured against the list the student
   already trusts.
3. **"Honest LeetHub" (folded-in candidate #20).** Opt-in publishing to a
   GitHub README of *verified process facts*: solved without paste, without
   the editorial, insight at 7 minutes, re-solved after 3 weeks in 4
   minutes. This turns visibility [S28] into the adoption mechanism the
   retention tools lacked.

No hints while solving, ever (CLAUDE.md non-negotiable).

## 8. The magic moment
After the third or fourth problem: *"You sorted the input and lost the original
indices. That's the 3rd time in 2 weeks (Two Sum, 3Sum Closest, Pairs With
Sum)."* It names a mistake the student didn't know they repeat, from their own
deleted code.

## 9. Why this could become a company
Students in placement season → all DSA preppers (adapter: NeetCode,
GeeksforGeeks, Codeforces) → **colleges' placement training budgets**.
Indian colleges pay external training vendors for placement prep. *Inference:
plausible, not verified in this research.* A college licence buys a cohort of
verified, process-based readiness evidence instead of attendance sheets. The
data asset is a large corpus of *solving processes*, which nobody else has
because platforms keep only final submissions.

## 10. Technical depth
- MV3 MAIN-world capture of Monaco operations and run/submit traffic, through
  an adapter that survives LeetCode changes (already designed).
- Operation-log compaction to revisions. Incremental tree-sitter parsing of
  *partial, non-compiling* code to fingerprint approaches.
- **Approach segmentation:** change-point detection over structural
  fingerprints. This is an algorithm problem with a labeled evaluation set.
- Cross-session mistake taxonomy with evidence thresholds. FSRS scheduling.
- LLM claims validated deterministically against the trace (ADR 0004), with an
  eval harness.

## 11. Why it would impress a FAANG reviewer
It shows data engineering on messy real-world event streams, an evaluated ML
and heuristic pipeline with honest metrics, browser internals,
privacy-by-design, and, if the validation passes, **retained real users with
measured outcomes** (time-to-insight dropping on re-solves).

## 12. First 10 users
Classmates in the builder's own placement batch. Recruit them in person during
a lab or library session: install the unpacked extension and solve two
problems from their sheet. Then reach the college coding club's WhatsApp group
and juniors via seniors (A2Z itself spread this way [S34]).

## 13. Validation experiment (before more building)
The **V0 gate already in the docs, plus a 2-week adoption test:**
1. Capture spike → V0 CLI → records for the builder's own 20 sessions (V0
   criteria 3–4).
2. Give 10 classmates an unpacked build for 2 weeks. Measure: records opened
   unprompted in week 2, cold re-solves attempted, and whether anyone turns on
   "publish to GitHub".
3. Ask: "Would you show this record to a recruiter?" (this tests the
   visibility lever).

## 14. Risks
- **Weak demand for retention tools** [S26]: the dominant risk.
- LeetCode breaks capture or objects to it (ToS, store review).
- LeetCopilot or LeetCode adds process capture.
- Seasonality: users churn when placed (accepted in the design, but it caps
  revenue).
- Interview formats drift away from LeetCode recall [S14]. Indian OA screening
  still leans on DSA (*inference*), which buys time but not forever.

## 15. What would kill this idea
- **Fewer than 4 of 10 classmates open a record unprompted in week 2.**
- The V0 blind test fails (the record isn't preferred over their own notes in
  14 of 20 cases).
- Nobody opts in to publishing *and* nobody attempts a cold re-solve. That
  would mean neither the learning lever nor the visibility lever works.

---

# Opportunity 2: Ledger (a comprehension ledger for AI-built code)

## 1. Name
**Ledger.** It tracks comprehension debt [S04, S05] the way a ledger tracks
money.

## 2. The exact user
**Final-year CS students building a capstone or major project in teams of
3–4 with Claude Code or Cursor, who must defend it in a viva or demo at the
end of the semester.**

The first 10–100: capstone teams in the builder's department, then
capstone teams at other Bangalore colleges via faculty coordinators.

## 3. The pain
The repository grows faster than their understanding. Comprehension debt shows
up in student diaries as black-box acceptance and verification bypass [S04].
In a viva, a team member can't explain a file "they" wrote [S20].

## 4. The deeper psychology
*"Is my degree real? Am I an engineer or an operator?"* The effect is invisible
to the person who has it [S02, S03], and testing yourself feels like
volunteering for bad news ([PSYCHOLOGY §3](../psychology/PSYCHOLOGY.md)).

## 5. The current workaround
Ask the agent to "explain the codebase" the night before the viva, have one
teammate who "knows everything", or read DeepWiki-style summaries [S36].

## 6. Why current software fails
Study modes are chat-local and don't know what you shipped [S39]. "Explain"
features produce reading, not retrieval [S06]. Team analytics such as Faros
serve managers, not learners [S05]. **No tool measures whether *this human*
understands *this code*.**

## 7. The product
A local-first CLI plus hooks for Claude Code (session-end hook) and git
(post-commit):

1. **Find the load-bearing changes.** For each commit or agent session, static
   analysis on the AST diff ranks the changes that matter: new control flow,
   error paths, concurrency, data-model and API changes, security-sensitive
   calls. It ignores formatting and boilerplate.
2. **Ask one to three prediction questions about *your* code**, preferring
   questions with **executable answers**: "What does `parse_rows([])` return?",
   "Which test fails if line 42 is removed?", "In what order do these two
   awaits complete?" Ledger runs the code or test in a sandbox to grade the
   answer, so grading is a *computed fact*. Open questions ("why a lock
   here?") get evidence-cited rubric grading (the ADR 0004 pattern).
3. **Keep a comprehension map:** per symbol and file, *explained / shaky /
   never checked*. Entries decay over time and are invalidated when the code
   changes.
4. **Team view:** who can explain what, i.e. a bus-factor view of the
   capstone.
5. **Viva mode:** the riskiest unexplained parts, as a drill.

The check is a *by-product of committing* (seconds per commit), not a separate
test. That is the lever against avoidance.

## 8. The magic moment
*"This week your team merged 2,300 lines. Together you could explain 41% of
the load-bearing changes. Here are the 5 an examiner is most likely to ask
about, and Priya is the only one who understands the auth middleware."*

## 9. Why this could become a company
Capstone teams → all students using agents for coursework → **junior engineers
in their first year** (the same fear, higher stakes) → teams adopting
"comprehension coverage" alongside test coverage as AI-written code share
rises. The individual-first framing must survive the move to teams. The
moat is a calibrated question bank and a per-user knowledge-tracing model over
*code*, not over flashcards.

## 10. Technical depth
- AST diffing and program slicing (tree-sitter) to rank load-bearing changes.
- **Automatic generation of execution-checked questions:** synthesizing
  inputs and predicting outputs, which is related to test generation and
  mutation testing, running in a sandbox.
- Knowledge tracing (BKT/IRT or FSRS-style) over code units that *change*
  underneath the learner, a novel twist.
- Claude Code hook integration, local-first storage, optional sync.
- An evaluation of question quality against human-written viva questions.

## 11. Why it would impress a FAANG reviewer
It is developer tooling at the AST level, with program analysis, test synthesis
and a learning model, applied to the industry's newest problem. It shows the
builder understands *how AI changes engineering work*, not just how to call
an API.

## 12. First 10 users
Two or three capstone teams in the builder's department. Approach them through
the capstone coordinator, using the faculty relationship that mark suggests
exists. *Inference: verify it.* Offer viva preparation as the hook.

## 13. Validation experiment
**Concierge test, no code:** take three teams' last two weeks of commits. By
hand (with an LLM's help), write 10 load-bearing prediction questions per
team. Run a 20-minute session. Measure: the share they answer correctly, their
reaction ("useful" vs "homework"), and whether they ask for it again before the
viva.

## 14. Risks
- **Avoidance:** they won't want to know, or will only use it the night
  before the viva (which makes it a smaller viva-prep tool).
- Questions feel like homework and get ignored after week 1.
- Claude Code or Cursor ship a native "quiz me on this diff" feature. Claude
  already has learning modes [S39].
- The counter-belief that agents make understanding unnecessary may spread
  faster than the evidence against it [S01].

## 15. What would kill this idea
- In the concierge test, students score ≥ 80%. The debt is smaller than we
  think.
- Fewer than 30% of users answer any question after week 1 of a live pilot.
- Students and faculty say they would use it *only* in viva week.

---

# Opportunity 3: Catch (a review gym built from real bugs)

## 1. Name
**Catch**, as in catching the defect before it ships.

## 2. The exact user
**Final-year students and new grads (0–12 months) who use AI coding tools daily,
have done 150+ LeetCode problems, and sense that "reviewing AI code" is now
the job but were never trained for it.**

The first 10–100: the builder's peers who have just joined jobs, plus
Discord and dev communities (r/cscareerquestions-adjacent, Indian dev Discords).

## 3. The pain
66% of developers say AI output is "almost right", and 45% lose significant
time debugging it [S18]. Confidence in AI suppresses checking [S03]. Novices
debug by trial and error [S08]. Juniors who merge plausible slop lose trust
[S37].

## 4. The deeper psychology
*"My job is becoming review, and I don't trust my own judgment over the AI's."*
The apprenticeship channel (human code review) is thinning just as review
matters most ([PSYCHOLOGY §6](../psychology/PSYCHOLOGY.md); inference).

## 5. The current workaround
Re-prompt, trust passing tests, ask the AI to review its own code, or wait to
learn on the job.

## 6. Why current software fails
BugHunt and BugSpotter use toy code with one obvious bug [S38]. LeetCode
trains writing, not reading. Real bug datasets (Defects4J, BugsInPy, SWE-bench)
exist only for research and AI evaluation, not for human practice [S38].

## 7. The product
- **Exercises are real PRs on real repositories.** Each is a historical
  commit in a real open-source project, presented as a pull request ("an agent
  made this change") with a plausible description. The defect is either (a)
  the *actual historical bug*, mined from bug-fix commits and BugsInPy, or (b)
  an injected defect from mutation operators modeled on AI failure modes
  (off-by-one at boundaries, a swallowed exception, a missing `await`, a stale
  cache key, API misuse).
- **The user reviews:** line comments, browse callers, run the tests in a
  sandbox.
- **Deterministic grading.** Full credit requires **a failing test that
  passes on the fixed version**, which is verifiable. Partial credit goes to a
  comment on the defect's lines.
- **Strategy feedback from the trace:** did they run the tests? read the
  callers? reproduce first? (This draws on the debugging research [S08].)
- **A calibrated skill profile:** item-response-theory difficulty per exercise,
  and catch rate and false-positive rate per defect class.

## 8. The magic moment
*"You approved. Tests passed. This exact change shipped in requests v2.x and
caused [the real issue, linked]."* The real history makes the consequence
tangible in a way toy bugs never do.

## 9. Why this could become a company
Individual practice → **hiring assessment** (review-based rounds fit the
AI-era interview shift [S14], and a calibrated item bank is exactly what
assessment companies need) → **onboarding programs** for juniors at
companies. The moat is the IRT-calibrated, contamination-resistant bank of
real defects, which is expensive to build.

## 10. Technical depth
- Mining bug-fix commits and building reproducible environments (containers;
  WebContainers or Pyodide for in-browser Python).
- A mutation engine with realistic defect operators. Checking that each defect
  is detectable by *some* test.
- A secure sandbox for running untrusted user tests.
- IRT calibration from response data. Anti-memorization: rotating and
  variant-generating items.

## 11. Why it would impress a FAANG reviewer
It shows infrastructure (sandboxing, reproducible builds), program analysis
(mutation testing), psychometrics (IRT) and data pipelines, all in service of
the skill FAANG reviewers themselves value most in juniors.

## 12. First 10 users
The builder's seniors who have just joined jobs (the most acute pain),
recruited by direct message. Then the college coding club as a weekly
"catch-the-bug" contest. Contests fit Indian college coding culture.

## 13. Validation experiment
Hand-build **5 exercises** from BugsInPy as a static page (diff, description,
repo link) plus a form that asks "which lines, and what test would expose it?"
Share with 30 students and new grads. Measure: the share who complete 2 or
more voluntarily, catch rates (calibration), and the answer to "would you do
this instead of a LeetCode problem today?"

## 14. Risks
- **The heaviest build of the five.** Sandboxing and repro are slow work.
- Students practice what interviews test (LeetCode), not what jobs need. Urgency
  only arrives on the job.
- Content cost: each good exercise is expensive, and the bank must stay ahead
  of memorization.
- Assessment incumbents (CodeSignal, HackerRank) add review tasks.

## 15. What would kill this idea
- Fewer than 20% of people who try one exercise do a second voluntarily.
- Engineers and recruiters say review skill is not evaluated or valued in
  junior hiring.
- Catch rates are uniformly high, meaning the skill gap isn't there.

---

# Opportunity 4: Viva (process-grounded understanding checks)

## 1. Name
**Viva.** Indian engineering labs already run viva voce checks (*inference
from common practice; verify locally*).

## 2. The exact user
**Instructors running programming lab courses (intro programming, DSA, OOP)
with 60–120 students at Bangalore engineering colleges, who already do manual
vivas or would like to, and whose homework grades no longer predict exam
performance [S19].**

The first 10–100: the faculty around the builder's mark extension (*verify
that the relationship exists*), then their department colleagues.

## 3. The pain
Homework scores near 100% while exam scores fall [S19]. Institutions are
reverting to oral checks at a large time cost [S20].

## 4. The deeper psychology
*"I'm grading the AI, and I've become a cop instead of a teacher."* Replay and
detection tools make the classroom adversarial
([PSYCHOLOGY §7](../psychology/PSYCHOLOGY.md)).

## 5. The current workaround
Manual vivas (a few minutes per student, in practice only a few questions),
proctored exams, and platform replay where available [S21].

## 6. Why current software fails
Replay shows *how code arrived*, not *whether the student understands it*, and
it's locked inside CodeHS, Codio and zyBooks [S21]. AI detectors are unreliable.
Research oral-exam systems ask general questions, not questions grounded in
*this student's code and process* [S11].

## 7. The product
1. **A lab editor:** a light Monaco page, or a VS Code extension, scoped to the
   assignment. It records revisions, runs and paste events, with no
   keystroke timing (Nue's capture design, reused).
2. **Grounded questions after submission:** three to five questions per
   student, built from *their* code and *their* process:
   - "You changed `<=` to `<` on line 14 right after a failing run. Why?"
   - "What does `merge([], [1])` return?" (graded by executing it)
   - "Lines 20–45 arrived in one paste at 10:42. Walk through what they do."
3. **A short, proctored check:** a 5-minute written or voice check in the lab,
   graded on evidence.
4. **The instructor view:** per student, *understands / shaky / can't
   explain*, linked to the exact lines and process events. A shortlist for
   the human viva.
5. **Student transparency:** students see the same evidence, framed as a
   learning check. This is non-negotiable for trust.

## 8. The magic moment
Thirty seconds after a lab closes, the instructor sees: *"9 of 64 students
couldn't explain code they submitted. Here are the exact lines."* That replaces
three hours of vivas.

## 9. Why this could become a company
One course → department → university (labs with vivas are common in Indian
engineering programs; *inference*) → license the question engine to
platforms (Codio, zyBooks) → the **same engine verifies take-home assignments
in hiring**. It has a natural network effect within institutions (shared
question banks per course).

## 10. Technical depth
- The capture core (from Nue), plus an execution sandbox for predict-the-output
  grading.
- Question generation from AST changes and process events, with deterministic
  validation (the ADR 0004 pattern).
- Multi-tenant classroom backend with roles. Privacy and compliance (India's
  DPDP Act 2023; FERPA if expanding to the US).
- A reliability study: agreement with instructor vivas and correlation with
  exams.

## 11. Why it would impress a FAANG reviewer
It is a real B2B product with real institutional users, privacy engineering,
assessment validity measured with statistics, and a reused core across products,
which shows architectural leverage.

## 12. First 10 users
Three or four faculty the builder knows. Start with **one lab section of one
course**. Ten instructors could come from one department within a semester.

## 13. Validation experiment
**Concierge pilot:** with consent, take one lab's anonymized submissions plus
whatever history exists (even final code alone). Hand-generate grounded
questions with an LLM and review them manually. The instructor runs them as
the viva for 10 students and records their own judgment. Measure: agreement
with the instructor, time saved, and whether the instructor asks to use it
again.

## 14. Risks
- Institutional sales, IT approvals, and lab infrastructure (offline labs,
  locked machines).
- Students perceive surveillance. This requires transparency and limited
  capture.
- Students use a phone AI during the written check. It must be proctored or
  in-lab.
- Platforms (Codio etc.) or research groups [S11] ship something similar.
- Payment comes slowly. Grants or departmental budgets come before revenue.

## 15. What would kill this idea
- Instructors won't run it in one real lab session after seeing a demo.
- Instructors rate the generated questions no better than their own.
- Viva scores don't correlate with exam performance (the check isn't
  valid).

---

# Opportunity 5: Proof (a verifiable build record)

## 1. Name
**Proof.**

## 2. The exact user
**Final-year students and recent grads from tier-2 and tier-3 colleges
applying off-campus, whose resumes are filtered by college tier [S35] and whose
portfolio projects look like every other AI-generated project [S17].**

The first 10–100: the builder's peers applying off-campus, and juniors
starting to build portfolios.

## 3. The pain
The credentials that used to separate candidates are collapsing: AI-generated
portfolios, CP ratings polluted by cheaters [S16], and suspicion of remote
assessments [S15]. Reviewers spend seconds per project [S17].

## 4. The deeper psychology
*"I actually did the work, and there's no way to show it. I look exactly like
the people who didn't."* This is an identity *and* fairness wound, stronger
for students without a brand-name college.

## 5. The current workaround
A long README, a demo video, a LinkedIn post, LeetHub green squares [S28], and
hoping someone asks about the project in an interview.

## 6. Why current software fails
GitHub shows commits, not reasoning, and commits can be generated. LeetHub
shows code, not authorship. Nothing captures the *process* (decisions,
debugging, what was AI vs human) in a form a reviewer can absorb in 90
seconds.

## 7. The product
1. **A recorder:** a CLI plus git, editor and agent hooks that log the build
   as events: commits, agent sessions (summarized; the raw prompts stay
   local), test runs, debugging episodes (failing → passing transitions), and
   one-line decision prompts at significant moments.
2. **Attribution:** line-level lineage through rewrites, tracking which lines
   were AI-written and accepted, AI-written and modified, or human-written.
   This is honest disclosure, not a purity score.
3. **A public build record page:** timeline, three key decisions with
   rationale, the hardest bug and how it was found, and the attribution
   summary.
4. **Live verification (the real proof):** a reviewer clicks "verify", and the
   candidate answers three questions about their *own* code in a timed,
   recorded session (the Ledger engine). It is timestamped and linked from the
   record.
5. **Honesty about limits:** client-side logs can be fabricated. The event log
   is hash-chained for tamper-*evidence* only, and the live check is what
   carries trust.

## 8. The magic moment
A recruiter opens the link and, in 90 seconds, sees the hardest bug the
candidate fixed, why they chose Postgres over Redis, and a timestamped answer
to "what breaks if this index is dropped?" The alternative was ten seconds on a
generic README.

## 9. Why this could become a company
Free for candidates → **paid verification for employers** (verified sessions,
search over verified builders) → a work-sample verification network. As
remote signals degrade, demand for verification rises [S15, S16]. *This is
two-sided, which is the hardest business on this list.*

## 10. Technical depth
- Event sourcing with hash-chained logs. Line lineage through refactors (a
  hard diff-tracking problem).
- Anti-gaming heuristics and statistical consistency checks.
- Agent-hook integration. Public pages with privacy controls.
- Shares the question engine with Ledger.

## 11. Why it would impress a FAANG reviewer
It shows an understanding of trust and provenance systems, careful threat
modeling (being explicit about what *can't* be proven), and product design for
a two-sided market. The builder's *own* Nue build record would be the
showcase.

## 12. First 10 users
The builder plus nine peers applying off-campus. The builder's own repos
(within, fay-winner, Nue) become the first three build records.

## 13. Validation experiment
**Recruiter test:** hand-build three build records for real student projects
(start with the builder's within and fay-winner). Show 10 engineers or
recruiters (alumni, LinkedIn) the record next to the plain GitHub repo.
Measure time spent and the answer to "would this change your screening
decision?" Separately, ask 10 students: "would you disclose your AI-use
breakdown publicly?"

## 14. Risks
- **Employers don't look.** The evidence that reviewers would use this is
  thin (Ev = 2) [S17].
- AI-use disclosure could *hurt* candidates, so they won't opt in.
- Gaming. Prompt privacy.
- Two-sided cold start. GitHub could ship provenance features (it is
  already working on AI attribution signals [S37]).

## 15. What would kill this idea
- Fewer than 3 of 10 reviewers spend more than 60 seconds on a record, or none
  say it would change a decision.
- Students consistently refuse to publish attribution.
- GitHub announces native AI provenance on commits.

---

# The final decision (yours, not ours)

## Opportunity 1: Nue (evidence)
- **For:** LeetCode amnesia is a long-running, widely reported pain [S22–S25].
  Retrieval science supports cold re-solves [S06]. The visibility lever has the
  strongest adoption signal found [S28]. The users are reachable. The design is
  done.
- **Against:** retention tools consistently fail to spread [S26]. Notes and
  mistake tracking already exist [S27]. Interview formats are drifting [S14].
- **Evidence quality:** strong for the pain, **weak for demand for a tool.**

## Opportunity 2: Ledger (evidence)
- **For:** the strongest research base: an RCT [S01], a large qualitative
  study [S04], a widening gap for weaker students [S02]. The vocabulary is
  emerging [S05]. There is no learner-side product.
- **Against:** urgency is low outside viva and interview moments. The avoidance
  loop. Frontier labs are adjacent [S39].
- **Evidence quality:** strong for the phenomenon, **moderate and unverified
  for felt pain.**

## Opportunity 3: Catch (evidence)
- **For:** the verification problem is broad and recent [S18, S03]. Debugging is
  teachable [S08]. Real-bug datasets are an unused asset [S38]. A plausible path
  into hiring [S14].
- **Against:** the heaviest build, and the least urgent for students (who
  practice for interviews, not jobs). Toy competitors are free [S38].
- **Evidence quality:** strong for the skill gap, **weak for practice
  demand.**

## Opportunity 4: Viva (evidence)
- **For:** a forcing function (grades), observed institutional behavior
  (oral exams returning [S20]), a commoditized-replay gap [S21], and cheap
  feasibility shown by research [S11]. The first users are physically
  reachable.
- **Against:** institutional sales speed, surveillance concerns, and nearby
  incumbents and research groups.
- **Evidence quality:** moderate. The instructor-pain evidence is partly a
  single anecdote [S19] plus news coverage [S20].

## Opportunity 5: Proof (evidence)
- **For:** signal collapse is well evidenced [S15, S16, S37]. Visibility drives
  adoption [S28]. It is the largest company outcome if it works.
- **Against:** no direct evidence that reviewers would use it [S17 is blogs].
  Two-sided. Disclosure risk.
- **Evidence quality:** **the weakest of the five.**

## Tradeoffs

| | 1 Nue | 2 Ledger | 3 Catch | 4 Viva | 5 Proof |
|---|---|---|---|---|---|
| Time to first real user | **~2 wks** (design done) | ~3 wks | ~5–6 wks | ~3 wks (concierge sooner) | ~3 wks |
| Strength of pain evidence | 🟢 | 🟢 phenomenon / 🟡 felt | 🟢 | 🟡 | 🟡 |
| Strength of demand evidence | 🔴 (S26) | 🟡 | 🔴 | 🟡 | 🔴 |
| Forcing function / urgency | Placement season | Viva / demo | Weak | **Grades** | Job search |
| Who pays | Student (weak), college (later) | Student → employer team | Student → assessment co. | **Institution** | Employer |
| Build risk | Medium (LeetCode adapter) | Medium | **High** | Medium | Medium-high |
| Portfolio signal | Real users + evals | AST and program analysis | Infra and psychometrics | B2B + validity study | Trust systems |
| Company ceiling | Medium | High | High | Medium-high | **Highest, but hardest** |
| Reuses existing work | **Most** | Some | Little | Much (capture) | Some |

## How they combine (not a recommendation)

- **Ledger's question engine *is* Viva's grading core and Proof's live
  check.** One engine, three markets. Building one makes the next cheaper.
- **Nue's capture core *is* Viva's lab editor.** Same adapter pattern, a
  different page.
- So the real choice may be **which user to start with, given a shared
  engine:** students during placement (1), students in capstone (2),
  instructors (4) or job seekers (5). Catch (3) stands apart and shares the
  least.

The choice is yours. Whatever you pick, the
[VALIDATION-PLAN](../validation/VALIDATION-PLAN.md) runs first, and its kill
criteria are binding.
