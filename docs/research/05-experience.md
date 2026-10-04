# 05 · Experience and interface

*Phases 9 and 10.*

## Phase 9: the journey, stage by stage

| # | Stage | Emotion | Question | Fear | User action | Product response | Psychological effect | Failure mode |
|---|---|---|---|---|---|---|---|---|
| 1 | Discovery | Anxious, hopeful | "Will this actually help?" | Another wasted tool | Sees a friend's skip list | Landing page shows a real skip list, not a promise | Specificity builds credibility | Generic "AI roadmap" messaging |
| 2 | Onboarding | Impatient | "How long will this take?" | Long forms | Opens the app | Three questions: destination, date, hours a week | Low effort, so commitment | Asking about "learning style" |
| 3 | Goal creation | Vague | "What exactly am I aiming for?" | Aiming wrong | Reviews the arrival test | Compiled test; editable; "here's what passing looks like" | Clarity; goal specificity | A test that feels wrong or generic |
| 4 | Assessment | Nervous | "Will this expose me?" | Looking bad | Takes 4–6 probes | First probe passable; private; "finding what you can skip" | Self-efficacy; gain frame | Probe too hard; feels like an exam |
| 5 | Roadmap reveal | Surprise, relief | "Is this right?" | It's wrong about me | Reads the skip list and gaps | Shows the evidence behind each claim; lets you contest one with a re-probe | Being seen; trust | Overclaiming certainty |
| 6 | First action | Motivated | "What now?" | Wasting the moment | Starts a 25-minute session | One problem plus one explanation; nothing else on screen | Momentum | Too many options |
| 7 | First success | Proud | "Did that count?" | Fake progress | Passes the micro-check | The blue dot moves *because of the check*; says which node | Real competence signal | Moving the dot for effort |
| 8 | Daily use | Routine | "What should I do now?" | Choosing wrong | Opens "Now", picks minutes | One action sized to time | Low decision cost | Recommendations that feel random |
| 9 | Progress | Encouraged | "Am I on track?" | Being behind | Weekly re-probe | Updated position and ETA range | Goal gradient (real) | Volatile forecast that whipsaws |
| 10 | Failure | Discouraged | "Am I bad at this?" | Confirmation of inadequacy | Fails a probe | "This is useful. It tells us exactly what's next." Shows the specific fix | Attributional retraining: effort and strategy, not ability | Grade-like language |
| 11 | Recovery | Guilty | "Is it too late?" | Wasted everything | Returns after a lapse | No mention of the gap; reroute; smallest session | Fresh start; no what-the-hell spiral | "You missed 9 days!" |
| 12 | Adaptation | Uncertain | "Is this still the right path?" | Sunk cost | Changes the date or hours | Re-solve; diff of the route; plain trade-offs | Autonomy, control | Silent plan changes |
| 13 | Milestones | Satisfied | "How far now?" | Plateau | Crosses a sub-goal | Brief, factual acknowledgement; no confetti storm | Competence | Gamified noise |
| 14 | Mastery / ready | Doubtful, excited | "Am I really ready?" | Overconfidence | Gets the "ready" verdict | Shows the evidence; recommends a final mock; "go apply" | Earned confidence | Saying ready too early (trust loss) |
| 15 | Goal completion | Relief or disappointment | "Did it work?" | Failure after all that | Reports the outcome | Pass: celebrate, collect the result. Fail: treat the real test as the best probe and reroute | Closure; learning from outcome | Not asking; a dead end after a fail |
| 16 | Next goal | Curious | "What's next?" | Starting over | Picks a next destination | Suggests a chained destination; carries the model over | Continuity | Upsell pressure |

## Phase 10: the interface

### Twelve home-screen models considered

| Model | What the home shows | Verdict |
|---|---|---|
| Dashboard | Charts, cards, stats | Rejected: overwhelm; invites analysis over action |
| Mission control | Many systems at a glance | Rejected: same problem |
| Chat | A blank prompt box | Rejected: pull-based; unused [S2, S3] |
| Today list | Tasks for today | Rejected: becomes a guilt list |
| Calendar | Time blocks | Rejected: owned by others; resentment risk [S16] |
| Skill map | The whole graph | Secondary view only; overwhelming as a home |
| Journey / timeline | The path from start to arrival | Secondary; good for the weekly view |
| Feed | Updates, peers | Rejected: engagement bait |
| Score | One readiness number | Too reductive; anxiety-inducing alone |
| **Now** | One action, sized to available time | **Primary** |
| **Position line** | One sentence: where you are, ETA | **Primary, above Now** |
| Map on demand | Pull up the full route and skill graph | **Secondary**, like Maps' route overview |

### Chosen: "Now", with the position on top and the map on demand

```
┌──────────────────────────────────────────────┐
│  Internship OA · Dec 1                       │
│  Likely ready around Nov 18–26               │  ← position line (range, honest)
│  ──────────────────────────────○─────────     │  ← distance to arrival test (evidence-based)
│                                              │
│  How much time do you have?                  │
│   [ 10 min ]   [ 25 min ]   [ 60 min ]        │
│                                              │
│  NOW · 25 min                                │
│  Choosing a data structure                   │
│  One problem, then explain your choice aloud │
│  Why this: you stalled on this in 3 of 3     │
│  probes, and it's on the OA's critical path  │
│                                              │
│              [ Start ]                       │
│                                              │
│  Route  ·  What I can skip  ·  History       │  ← map on demand
└──────────────────────────────────────────────┘
```

**Design rules:**

- One primary action per screen. No cards grid.
- Every recommendation carries a one-line **why** that cites evidence.
- Ranges, not false precision; wording in plain language.
- A calm, neutral palette; type-led; no gradients, glow or "AI sparkle".
- During probes: a full-screen, distraction-free view with no AI help
  available, said explicitly ("This is a check. No hints, by design.").
- Notifications: at most one per day, only for a session the user chose,
  never about lapses.
- The overall message: **you don't need to figure everything out. You
  need the next turn.**
