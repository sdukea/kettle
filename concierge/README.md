# Pillow concierge kit (v0)

Three weeks, 15–20 students, no code. You are Pillow: you measure where each
student stands, tell them what to skip, send one task a day, re-check weekly,
and say honestly when they're ready.

**The question this answers:** will people let themselves be measured, and do
they find the result useful enough to pay for? See
[THESIS §11](../docs/THESIS.md#11-the-mvp) and
[08-build](../docs/research/08-build.md#mvp-v0-concierge-weeks-13).

## What's in the kit

| File | Use it for |
|---|---|
| [skill-map.md](skill-map.md) | The 30 interview topics, their prerequisites, and what "ready" means for each destination |
| [checks.md](checks.md) | 40 short checks (code, approach, find-the-bug, explain-aloud), each tagged to topics |
| [rubric.md](rubric.md) | How to score a check, turn scores into topic status, build the skip list, and estimate a ready-by date |
| [intake.md](intake.md) | Intake form questions and the consent line |
| [messages.md](messages.md) | Every message you send: outreach, booking, result, daily task, weekly update, lapse, ready, pre-pay, outcome |
| [tracker/](tracker/) | Spreadsheet templates (CSV, import into Google Sheets) |
| [decision.md](decision.md) | The week-3 decision, filled in at the end |

## Keep student data out of this repo

This repository is public. Copy the CSV templates into a **private Google
Sheet** and keep all names, contacts and results there. `concierge/data/` is
git-ignored in case you export anything locally.

## Schedule

### Week 0 (setup, about 4 days)
1. Read the skill map and do every check yourself once, timed. Fix anything
   that feels unclear.
2. Create the private Google Sheet from `tracker/`.
3. Make the intake form (Google Forms) from [intake.md](intake.md).
4. Post the outreach message in 3–5 placement or coding groups. Target: 25+
   sign-ups so that 15–20 show up.
5. Book 30-minute position-fix calls (Google Meet or Discord, screen share,
   with an online editor such as a shared LeetCode playground or Replit).

### Week 1
- **Day 1–3: position fixes.** One 30-minute call per student (see
  [rubric.md § Running a position fix](rubric.md#running-a-position-fix)).
  Send the written result within 2 hours of the call.
- **Daily from the day after their fix:** one "Now" message per student
  before their usual study time. Log whether they did it.

### Week 2
- **Weekly re-check** (15 minutes, async or on a call): 2–3 checks aimed at
  their gaps plus one at a topic you marked Unknown. Update the tracker and
  send the weekly update.
- Keep daily "Now" messages going. Send the lapse message after 3 silent days,
  once.

### Week 3
- Second weekly re-check and update.
- **Pre-pay ask** to every active student (see [messages.md](messages.md#pre-pay-ask)).
- Ask everyone to report their real test result whenever it happens.
- Fill in [decision.md](decision.md).

## Your daily routine (about 60–90 minutes for 15 students)
1. Open the sheet. For each active student, look at their gaps and last result.
2. Pick today's task: the highest-weight Gap topic whose prerequisites are
   Solid. If a high-weight topic is Unknown, today's task is a check instead.
3. Send the "Now" message, sized to the minutes they said they have.
4. Log replies and results in `checks_log`.

## Kill criteria (binding, decided at the end of week 3)

All three must hold to continue to v1:

| Metric | Threshold |
|---|---|
| Finished the first position fix | ≥ 50% of sign-ups who booked |
| Completed the second weekly re-check | ≥ 30% of those who did a position fix |
| Actually pre-paid for the rest of the season | ≥ 5 students |

If it fails, diagnose before deciding: was it **framing** (people avoided
being tested) or **value** (the result wasn't accurate or useful)? The answers
in the week-3 interview questions in [decision.md](decision.md) tell you which.

## Things to watch for (write them down as they happen)
- Anyone who books but doesn't show: what did they say?
- Moments a student disagrees with a result. Were they right?
- Whether the skip list changes what they actually study.
- How long each position fix and each daily message really takes you. That's
  the cost model for v1.
