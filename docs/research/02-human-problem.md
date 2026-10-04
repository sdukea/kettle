# 02 · Why humans fail to accomplish things

*Phases 2 and 3. Tags: [F] [I] [H] [S]. Literature marked "established" is
canonical research cited from prior knowledge, not re-verified in this
session.*

## A model of failure

Goal pursuit fails at five points. Each has a typical mechanism and a
typical product response, and most products respond at the wrong layer.

| Layer | What goes wrong | Mechanisms (literature) | What products do | What would actually help |
|---|---|---|---|---|
| 1. Destination | The goal is vague ("become a developer") | Vague goals underperform specific, hard ones (Locke & Latham, established) | Ask the user to write a SMART goal | **Compile** the goal into an arrival test |
| 2. Position | No idea where you stand | Dunning–Kruger-style miscalibration; avoidance of diagnostic feedback when identity is at stake [F, S28] | Self-assessment sliders, checklists | **Measure** with short, low-stakes probes |
| 3. Route | The path is unbounded and unsequenced | Cognitive load (Sweller, established); prerequisites unclear | Show the whole roadmap (overwhelm) | Show only the next turn; prune via the skip list |
| 4. Execution | Starting, continuing | Procrastination tied to task aversiveness and delay (Steel 2007 meta-analysis, established); implementation intentions help, d≈0.65 [F, S7] | Reminders, streaks | Tiny, time-fit next action plus when/where planning |
| 5. Feedback and recovery | No visible progress; one lapse ends everything | Goal gradient [F, S9]; what-the-hell effect (Polivy & Herman, established); fresh start effect [F, S8] | Progress bars on time spent; streak loss | Progress that moves only on evidence; guilt-free reroute |

**Key observation [I]:** the industry is concentrated on layers 3 and 4,
while layers 1, 2 and 5 are where the failures cascade from. A wrong or
unknown position (2) makes the route (3) untrustworthy, which makes
execution (4) feel pointless, which makes the lapse (5) terminal.

## The listed failure causes, grouped

- **Uncertainty-driven:** ambiguity, fear of choosing the wrong path, fear
  of wasted time, unclear prerequisites, lack of sequencing, "no
  trustworthy next action", goal switching, "keep changing my plan". Root
  cause: **no position, no destination.**
- **Load-driven:** cognitive overload, information overload, choice
  paralysis, too many resources. Root cause: **unbounded scope.** (Note:
  the classic choice-overload effect is weaker than its fame suggests; a
  2010 meta-analysis by Scheibehenne et al. found a mean effect near zero.
  Unbounded scope is the stronger explanation [I].)
- **Feedback-driven:** lack of feedback, lack of visible progress, no
  momentum, skill plateaus, "don't know if I'm progressing", social
  comparison. Root cause: **progress is measured by consumption, not
  position.**
- **Affective:** fear of failure, perfectionism, anxiety, identity
  conflict. Root cause: **measurement threatens identity**, so people avoid
  it [F, S28].
- **Planning-driven:** unrealistic planning, poor estimation (the planning
  fallacy, Buehler et al. 1994, established), planning addiction. Root
  cause: **plans are cheap to make and feel like progress.**
- **Environmental:** no accountability, no support, context switching,
  existing commitments. Partly outside product scope; time-aware next
  actions help.
- **Memory:** forgetting. Spaced retrieval is well-established (Cepeda et
  al. 2006; Roediger & Karpicke 2006).

## Problem types A–F, ranked

| Problem | Description | Size | Solved today? | Value for us |
|---|---|---|---|---|
| A | Don't know what I want | Large | No, but this is career and life counselling; very hard to verify | **Out of scope** |
| B | Know what, not how | Large | **Yes, commoditized** by LLMs and roadmap.sh | Low (table stakes) |
| C | Know how, don't execute | Largest | Partly, via habit mechanics, often with dark patterns | Medium, indirect |
| D | Execute, can't tell if progressing | Large | **No**, outside a few domains | **High** |
| E | Progressing, is this the optimal path? | Medium | **No** | **High** (needs D first) |
| F | Overwhelmed, abandon | Large | No; streaks make it worse after a lapse | High, via bounded scope and reroute |

**Conclusion:** D and E are the highest-value, least-solved problems, and
solving them (measurement plus rerouting) also reduces C and F: people
execute more when they can see real movement (goal gradient) and abandon
less when the scope is bounded and lapses are recoverable [I/H].

## The avoidance loop (why measurement is also the hardest sell)

From earlier research [S28]:

```
uncertain about ability ─► measuring might hurt ─► avoid measuring
        ▲                                                │
        └──── consume more content (feels safe) ◄─────────┘
```

"Tutorial hell" is this loop seen from the outside [S27]. Any
measurement-first product must break it **emotionally before
epistemically**:

1. **Gain framing:** the first output is "what you can skip".
2. **Low stakes:** private probes, short, presented as "check", never as a
   "test score".
3. **Early wins by design:** the first probe is chosen to be passable.
4. **Uncertainty, not verdicts:** "probably solid" or "not sure yet, one
   more check" instead of grades.
5. **No audience:** nothing is shared unless the user chooses to.

## Psychological core: mechanisms we use and don't use

| Mechanism | Use? | How |
|---|---|---|
| Progress visibility | Yes | Only evidence-driven; the blue dot moves on probes |
| Goal gradient [S9] | Yes | Real distance to the arrival test; **no** illusory head-start |
| Immediate feedback | Yes | Every session ends with a micro-check |
| Commitment | Lightly | Agreeing the arrival test is a commitment; no public pledges |
| Self-efficacy | Yes, central | Mastery experiences are the strongest source (Bandura) |
| Competence, autonomy (SDT) | Yes | Explainable route; overrides allowed |
| Identity | Carefully | "Becoming someone who can X" only after evidence |
| Momentum | Yes | Tiny time-fit next actions |
| Variable difficulty | Yes | Desirable difficulty, matched to position |
| Reward prediction / variable rewards | **No** | That's a compulsion loop |
| Zeigarnik effect | Lightly | Leave a session at a natural "open loop" only when the user chose to stop |
| Loss aversion | **No** | No streak loss |
| Implementation intentions [S7] | Yes | One-tap when/where at the end of a session |
| Habit loops | Lightly | A cue (time) plus a tiny action; no artificial reward |
| Social proof | Only true | "People at your position typically need about 3 weeks" (calibrated) |
| Accountability | Opt-in | Peer probes; cohort seasons |
| Mastery and flow | Yes | Sessions sized to stay in the challenge band |
| Curiosity | Yes | Show what unlocks next |
| Narrative progression | Yes | The journey from fix to arrival is the story |

**Dark patterns to avoid:** artificial urgency, shame, fear-based
retention, fake scarcity, deliberately addictive loops, obstructed
cancellation, manipulative notifications, false progress, social
humiliation, and progress that moves for time spent.

**Retention principle:** leaving should feel *unnecessary*, not difficult.
Concretely: if a user would be better served by stopping ("you're ready"),
the product says so.
