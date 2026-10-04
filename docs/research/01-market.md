# 01 · Market: reverse-engineering the landscape

*Phase 1. Tags: [F] fact (sourced), [I] inference, [H] hypothesis,
[S] speculation. Sources: [SOURCES.md](SOURCES.md).*

## The one-paragraph map

Every product that turns goals into action owns **one** of four things:
**content** (Coursera/Udemy, YouTube, Brilliant), **plans** (roadmap.sh,
LLM chat, AI roadmap generators), **time** (Motion, Reclaim, Sunsama,
Todoist), or **habit** (Duolingo, Habitica, Fabulous, Strava). Almost none
owns **position**: a trustworthy, continuously updated estimate of where
the user actually stands relative to a destination. The ones that do (Math
Academy, Runna, Speak, Duolingo within its own course) are single-domain,
and they're the ones with strong outcomes or retention [I].

## Category saturation

| Category | Saturation | Where exactly |
|---|---|---|
| AI plan/roadmap generation | **Saturated** | Free in ChatGPT, Gemini and Claude [S12, S13]; roadmap.sh AI plans and courses for 3.2M learners [S11]; many SEO "roadmap generator" sites |
| AI tutoring / chat help | **Saturated, low engagement** | Study modes in all three labs [S12, S13]; Khanmigo used by about 15% of students with access [S3] |
| Courses and content | **Saturated, consolidating** | Coursera + Udemy merged (May 2026, 290M learners) [S15] |
| Task and time planning | **Crowded** | Motion, Reclaim, Sunsama, Todoist, Notion Calendar; recurring complaint about over-packed days [S16] |
| Habit and streak apps | **Crowded, poor retention** | Typical D30 retention in single digits (secondary, low confidence) [S24]; Duolingo is the outlier |
| AI life coaches | **Crowded, weak** | Rocky.ai, Saner and similar; reviews say chats drift away from the goal [S17] |
| Proactive personal agents | **Hot, capital-intensive** | ChatGPT Pulse, Gemini proactive features [S14]; Instinct ($10B, SMS agent doing errands) [S25] |
| **Measured position + rerouting toward a dated goal** | **Sparse** | Exists only per-domain: Runna (running) [S18], Math Academy (math) [S19], Speak (speaking) [S29] |

## Competitor teardowns

Each is condensed to the questions that matter most from the 16 in the
prompt. "Still on the user" is what the user must figure out alone.

### ChatGPT / Claude / Gemini (incl. study and learning modes)
- **Claimed problem:** answer anything; with study modes, "learn, don't
  just get answers" [S12, S13].
- **Actual use:** instant plan or explanation on demand; "make me a
  roadmap for X" prompts are a genre [I, S26].
- **Trigger → return:** a question in the moment → the next question.
  There's no reason to return to *the goal*.
- **Emotional need:** relief from ambiguity in the moment.
- **Excels at:** decomposition, explanation, patience, breadth.
- **Fundamentally fails at:** knowing where you actually are (it believes
  your self-report), remembering a plan as a commitment, observing
  execution, and saying "you're ready". Unguarded use can *harm* learning:
  17% lower exam scores despite better practice scores [F, S4].
- **Still on the user:** whether the plan fits them, whether they're
  progressing, when to stop.
- **After the excitement:** the plan sits in a chat history. [I]
- **AI-now capability:** everything here exists now; that's the point:
  it's a commodity.
- **What users can't get:** a model of *them* that's evidence-based rather
  than conversational.

### roadmap.sh
- **Claimed:** community roadmaps for developer careers; now AI tutor,
  generated courses and plans [S11].
- **Actual use:** a canonical map of "what exists" in a field; reassurance
  that the territory is finite [I].
- **Excels at:** trusted, curated, public maps; huge SEO and brand
  presence.
- **Fails at:** the map is the same for everyone. Progress is self-ticked
  checkboxes (self-report, not measurement) [I].
- **Still on the user:** what they can skip, how deep to go, whether
  they're ready.
- **Overwhelm point:** seeing the entire backend roadmap at once [I].
- **Threat level to us:** high on plans, low on position.

### Coursera / Udemy (merged)
- **Claimed:** job-relevant skills and credentials [S15].
- **Actual use:** a structured course as a commitment device; a
  certificate as a signal [I].
- **Fails at:** completion. The MOOC base rate is about 3% of registrants
  [F, S1]. It also can't tell you what to skip, because it profits from
  completion of its own catalog [I].
- **Psych mechanism:** sunk cost and commitment (paid learners complete
  far more: 46% vs 3.13% [F, S1]).
- **Lesson:** paying is a stronger completion lever than any feature [I].

### Duolingo
- **Claimed:** learn a language free.
- **Actual use:** a daily ritual that *feels* like progress; streak
  maintenance [I].
- **Metrics:** about 58.7M DAU in Q2 2026, +23% YoY, driven by retention of
  current users [F, S10].
- **Psych mechanism:** streaks (loss aversion), leagues (social
  comparison), variable reward, an always-tiny next action.
- **Excels at:** making the next action effortless, and at systematic
  retention A/B testing [F, S10].
- **Fails at:** proving real-world competence; users report long streaks
  with weak conversational ability (widely discussed; not quantified here)
  [I].
- **Lesson:** the "tiny next action" is the right shape; loss-framed
  streaks are the part we refuse.

### Khan Academy / Khanmigo
- **Key evidence:** in a two-year school study, students rarely engaged
  the AI tutor productively; gains came from the structured practice
  platform, not the AI [F, S2]; about 15% of students with access use it
  [F, S3].
- **Lesson:** **pull-based AI help doesn't get pulled.** The system must
  push one action, and value comes from structure and sequencing [I].

### Math Academy
- **What it is:** a knowledge graph of several thousand math topics, fully
  adaptive diagnostics, mastery learning, and spaced repetition that
  propagates credit down prerequisites (FIRe) [F, S19].
- **Excels at:** exactly what our thesis says matters: a precise position
  and the shortest path. Users report dramatic speed-ups (vendor claims;
  treat with caution) [S19].
- **Fails at:** anything outside math; building the graph took years of
  expert labour [I].
- **Lesson:** this is the existence proof for "GPS, not map", and for how
  expensive the GPS is to build per domain.

### Runna (acquired by Strava, 2025)
- **What it is:** an adaptive running plan toward a dated race; adapts
  from watch data [F, S18].
- **Why it works:** the arrival test (race distance and time) is explicit;
  the position (pace, heart rate) is measured automatically; reroutes are
  cheap [I].
- **Lesson:** the closest existing analogue to the full thesis, and proof
  that consumers pay for it. Strava bought it rather than built it [F, S18].

### Strava
- **Metrics:** about 195M registered and 50M MAU; subscription-led revenue
  (secondary analyst data) [S18].
- **Psych mechanism:** social proof of effort; segments as public, fair
  arrival tests [I].
- **Lesson:** activity becomes social when it's *measured objectively* and
  comparable. Segments are, in effect, published arrival tests [I].

### Motion / Reclaim / Sunsama / Todoist
- **Claimed:** an AI that plans your day.
- **Actual use:** relief from deciding when to do things.
- **Complaints:** days packed too tightly, plans that keep reshuffling,
  questionable prioritization, price [F, S16; the review aggregator is a
  competitor-authored blog, so treat as indicative].
- **Fails at:** knowing which tasks *matter* for a goal. They optimize
  time, not progress [I].
- **Lesson:** time optimization without a value model makes people feel
  managed, not helped.

### Notion / Obsidian (PKM, "life OS")
- **Actual use:** building the system instead of doing the work ("planning
  addiction") [I].
- **Lesson:** a flexible canvas invites procrastination dressed as
  organization. Our product should have almost no configurable surface.

### Habitica / Fabulous / habit trackers
- **Mechanism:** gamification and streaks; ritual coaching.
- **Fails at:** a large share abandon within weeks; a missed day often
  triggers abandonment rather than recovery [S24, low confidence;
  consistent with the "what-the-hell effect" literature].
- **Lesson:** design for the lapse as the main case, not the edge case.

### LeetCode / NeetCode / AlgoExpert / Exponent (our wedge)
- **Prices:** LeetCode Premium about $35/month or $179/year; Exponent about
  $99/month, $1,499 course packages [F, S23; secondary].
- **Actual use:** practice volume as an anxiety sedative; "how many have
  you done?" is the folk progress metric [I].
- **Fails at:** telling you whether you're ready. Problem count is a
  consumption metric, not a position [I].
- **Still on the user:** which patterns they actually own, what to skip,
  when to stop and apply.

### LinkedIn / YouTube / Reddit / Quora
- **Role:** discovery and reassurance. YouTube is the default content
  layer; Reddit and Quora are where "is this path right?" gets asked, and
  answered with survivorship anecdotes [I].
- **Lesson:** the "is my path right?" question is huge and is currently
  answered by strangers' anecdotes. A calibrated answer is the opening.

### Proactive agents (Pulse, Gemini proactive, Instinct)
- **Direction:** assistants that act without prompts and do tasks for you
  [S14, S25].
- **Implication:** "do things for me" is being commoditized at enormous
  capital scale. Skill acquisition is the one category where the agent
  *must not* do the work [F, S4]. That's a durable boundary for us [I].

## What AI makes possible now that it didn't five years ago

1. **Compiling vague goals into concrete arrival tests** (requires broad
   world knowledge).
2. **Generating probe items on demand** for any skill node, including
   open-ended ones.
3. **Grading open responses** (explanations, designs, code reasoning)
   against rubrics. It isn't perfectly reliable, but it's useful with
   uncertainty bounds.
4. **Speech in and out**, so "explain it to me aloud" is a cheap probe.
5. **Drafting skill graphs** for a new domain in hours rather than months,
   with expert correction.

**What AI still doesn't do well:** stable mastery estimation over time.
Specialized knowledge-tracing models outperform LLMs and are far cheaper
[F, S20]. That's why the architecture is hybrid
([04-engine](04-engine.md)).

## User language (collected)

Reddit blocked automated access, so this comes from HN, dev.to, app-store
and Trustpilot reviews, and secondary compilations. All paraphrased except
very short quotes.

- "Tutorial hell": consuming tutorials and then being unable to build
  alone [S27].
- Don't know where to begin; too many resources open at once, learning
  nothing [S27].
- "How do you create a learning plan?" (HN) → answered with "search for a
  roadmap" [S26]: people re-ask the plan question even though plans are
  abundant.
- From an AI coach review: unclear how the chats feed "the main goal"
  [S17].
- From AI planner reviews: the day packed too tight; the plan keeps
  reshuffling [S16].
- From developers about AI: output that's "almost right, but not quite"
  [S21]: the trust gap.
- "You will always feel behind" (dev.to): no real position, so people
  compare socially [S27].

**Pattern [I]:** the phrases cluster on *position* (where am I, what can I
skip, am I ready, am I behind) far more than on *route* (what are the
steps). That's the empirical core of the thesis, and the claim most in need
of interview validation.
