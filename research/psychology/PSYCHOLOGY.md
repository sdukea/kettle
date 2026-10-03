# Psychology: What Sits Underneath the Surface Complaints

For each major pain in [USER-PROBLEMS](../user-research/USER-PROBLEMS.md),
this document separates five layers:

| Layer | Question |
|---|---|
| **Surface** | What does the person say is wrong? |
| **Behavioral** | What do they actually do? |
| **Emotional** | What do they feel? |
| **Identity** | What belief about themselves is threatened? |
| **Economic** | What happens to their career if it stays unsolved? |

**Status of this document:** this is mostly **interpretation**. Layers marked
*(evidence)* rest on cited sources. Everything else is our hypothesis, built
from patterns across sources, and must be checked in user interviews
([VALIDATION-PLAN](../validation/VALIDATION-PLAN.md)). We have not interviewed
anyone yet.

---

## 1. LeetCode amnesia (A1)

| Layer | Content |
|---|---|
| Surface | "I forget solutions I've already solved." *(evidence: S22, S23, S25)* |
| Behavioral | Solve more problems rather than review old ones. Re-start curated lists. Try Anki and abandon it. Count solved problems as progress. *(evidence: S24, S26)* |
| Emotional | Panic that comes with a deadline ("interview at Bloomberg, family depends on it", S23). Shame at re-failing an "Easy" problem they once solved. |
| Identity | "Maybe I'm not smart enough for this. Other people *get* patterns and I just memorize." |
| Economic | They fail an interview on a pattern they had "covered", and the solved count gave false assurance. |

**The underlying problem:** the solved-count is a *comforting* metric, which
is exactly why people keep optimizing it. Reviewing old problems risks
discovering that the count overstates their ability. **Re-solving is an
identity risk, and solving new problems is identity-safe.** This explains the
behavioral evidence: retention tools stall [S26] while tools that *display* the
count spread [S28].

**Design implication:** a retention product that just says "review this
problem" asks the user to take the identity risk with nothing in return. It
must either make the review feel like *evidence of growth* ("you found the
insight 9 minutes faster than last time") or attach it to something
visible.

---

## 2. "Am I actually getting better?" (A2)

| Layer | Content |
|---|---|
| Surface | "I don't know if I'm improving." |
| Behavioral | Track volume (problems solved, streaks, hours). Compare against peers' counts and offers. Switch resources often, because a new sheet feels like progress. |
| Emotional | Low-grade anxiety. A fear of wasting the most valuable months. Decision paralysis about what to do next. |
| Identity | "Effort should equal progress. If I can't see progress, maybe my effort is worthless, or I am." |
| Economic | Misallocated months: grinding the wrong things while the placement window closes. |

**The underlying problem:** they have no **instrument**. Every available
measure is either volume (gameable and not diagnostic) or a high-stakes test
(an interview or exam, which comes too late to act on). The missing thing is
a *low-stakes, trustworthy, frequent* measure of skill.

---

## 3. AI dependence (A4, G1)

| Layer | Content |
|---|---|
| Surface | "I use AI a lot, and I'm worried I can't code without it." *(evidence: S18, S40)* |
| Behavioral | Keep using AI because deadlines are real and the work gets done. Avoid unassisted situations. Feel relief when an assignment "works". *(evidence of the phenomenon: S04)* |
| Emotional | Fraud anxiety, fear of being "found out", and guilt. These coexist with relief and productivity. |
| Identity | "Am I an engineer, or someone who operates an engineer?" For students: "Is my degree real?" |
| Economic | Failing an in-person or oral check [S14, S20], or failing in a first job where judgment is needed and nobody spells out the task. |

**The underlying problem:** the effect is *invisible to the person who has
it*. Struggling students over-estimate their own performance [S02], and
confidence in AI displaces checking [S03]. **The people who most need the
signal are the least likely to seek it.** This is the central psychological
trap.

**Design implication:** no product here survives if it relies on users
volunteering for a painful test. Workable framings:

- **Make the check a by-product of work they already do** (e.g. two questions
  about the diff they just merged), not a separate exam.
- **Show evidence of competence, not just deficits.** "You explained 14 of
  your last 16 changes" builds the identity of "someone who understands their
  code". The identity of "someone who doesn't" is not one anyone wants.
- **Use external triggers.** People seek the truth when something forces it
  (an oral exam next week, an onsite in two weeks). This is why the
  instructor and interview-window segments matter.

---

## 4. Avoidance: the cross-cutting dynamic

Three pains (amnesia, measuring improvement, AI dependence) share one
mechanism:

```
uncertain ability ──► anxiety ──► measurement threatens identity ──► avoid measurement
       ▲                                                                    │
       └──────────────── ability stays uncertain (or degrades) ◄────────────┘
```

Coping behaviors that keep the loop going are visible in the evidence: count
more problems, start a new sheet, use more AI, consume another tutorial,
read the editorial "just to check". Each produces a *feeling* of progress
with no risk of *evidence* against.

**Implication for every opportunity:** the product has to break this loop
somewhere. The candidate break points are:

1. **The trigger:** attach to a moment of forced truth (an exam, an interview,
   placement week, a teacher's check).
2. **The framing:** measure growth relative to *yourself*, not a pass/fail
   absolute.
3. **The cost:** make measurement nearly free in time, a by-product of
   ordinary activity.
4. **The reward:** turn honest evidence into something the person can *show*
   ([S28] suggests visibility drives adoption).

These four levers are used to evaluate the opportunities in
[TOP-5](../opportunities/TOP-5.md).

---

## 5. Interview stress (A6)

| Layer | Content |
|---|---|
| Surface | "I blank in interviews." *(evidence: S09)* |
| Behavioral | Over-prepare content, under-practice performance under observation. Avoid mocks with real humans (expensive, embarrassing). |
| Emotional | Acute anxiety. Rumination after a failure. |
| Identity | "I'm worse than my preparation says." |
| Economic | Lost offers in a market with fewer entry-level roles [S13]. |

**The underlying problem:** the gap is between *private* ability and
*observed* performance [S09]. Content products cannot close it. Only
practice under observation can. This is crowded and was not pursued as a wedge
([OPPORTUNITY-MATRIX](../opportunities/OPPORTUNITY-MATRIX.md) #12).

---

## 6. Verifying AI code (G2)

| Layer | Content |
|---|---|
| Surface | "AI code is almost right, and finding what's wrong takes forever." *(evidence: S18)* |
| Behavioral | Re-prompt instead of reading. Accept the change if tests pass. Ask the AI to review its own code. |
| Emotional | Frustration, and low confidence in their own judgment ("it's probably right and I'm missing something"). |
| Identity | "My job is shifting to reviewing, and I was never taught to review." |
| Economic | Shipping defects. Being seen as someone who merges slop, which juniors now get rejected for [S37]. |

**The underlying problem:** reviewing is a skill learned through feedback on
many examples with known answers. Juniors used to get that slowly through human
code review. With fewer juniors hired [S13] and seniors reviewing more AI
output, **the apprenticeship channel for review skill is thinning at the moment
review skill matters most.** (Interpretation. Plausible and coherent with
S13, S18 and S37, but not directly measured.)

---

## 7. Instructors (M1)

| Layer | Content |
|---|---|
| Surface | "Homework grades no longer tell me who learned." *(evidence: S19, S20)* |
| Behavioral | Add oral checks at a high time cost. Lean on proctored exams. Adopt replay tools inside platforms [S21]. |
| Emotional | Demoralization ("am I grading the AI?"), and suspicion of students, which erodes the relationship. |
| Identity | "My job is to teach, not to police." |
| Economic | For the institution: degree credibility and accreditation. For the instructor: grading hours. |

**The underlying problem:** instructors want to see *understanding*, but the
tools they have show *integrity* (paste detection, replay). Policing produces
an adversarial classroom. A tool that framed its output as a *learning
check* rather than *cheating detection* would match the instructor's identity
better. This is an interpretation to test.

---

## 8. What we must learn from real people

Questions to answer in interviews (scripts are in
[VALIDATION-PLAN](../validation/VALIDATION-PLAN.md)):

1. When did you last discover you couldn't do something you thought you could?
   What happened next? (This tests the avoidance loop.)
2. What do you currently use to decide whether you're improving? (This finds
   the real metric.)
3. Have you ever *stopped* using a tracking or review tool? Why? (This tests
   why retention tools stall.)
4. What would you be willing to have shown to a recruiter or teacher? (This
   tests the visibility lever.)
