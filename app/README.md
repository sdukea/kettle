# Pillow app (thin version)

The smallest version of Pillow that can run the three-week test with 15–20
students. It covers screens 1–18 of the
[walkthrough](../site/walkthrough.html). The founder does the parts that
aren't automated yet: scoring spoken explanations and confirming payments, both
in `/admin`.

## What a student gets

1. **Sign up**: name, email, WhatsApp, and consent.
2. **Goal**: test type, date, hours a week, Python or JavaScript.
3. **Finish line**: what passing looks like for that test.
4. **The 15-minute check**: 8 adaptive checks. Write code (it runs in the
   browser), choose an approach, find a bug, and explain a concept.
5. **Result**: what they can skip, their real gaps with evidence, what isn't
   checked yet, and a ready-by range compared with their test date.
6. **Season**: ₹499 by UPI, confirmed by hand. The first 3 days are free.
7. **Now**: one task sized to 10, 25 or 60 minutes, with the reason it was
   picked.
8. **Daily task**: practise one problem (in the app with tests, or on
   LeetCode), answer a quick check, see what moved, plan the next session,
   and add it to a calendar.
9. **Weekly check-in**: 3 checks after 7 days that update the plan.
10. **Timed mock**: comes up when every requirement is met; passing it means
    "ready".
11. **Route, Ready, and Report a result.**

## What the founder gets (`/admin`)

- The three stop-or-continue thresholds, live.
- The funnel, from sign-up to reported result.
- Explanations to score (0–3), with the rubric beside each.
- A row per student: contact, private sign-in link, skip %, gaps, ready-by,
  activity, and payment status (editable).
- A CSV export of every answer.

## Run it locally

Needs Node 22.13 or later (it uses Node's built-in SQLite).

```bash
npm install
```

```bash
npm run build && ADMIN_PASSWORD=choose-one UPI_ID=you@upi npm start
```

Open http://localhost:8787 for the app and http://localhost:8787/admin for
admin. For live reloading while editing, run `npm run dev` and open
http://localhost:5173.

```bash
npm test
```

75 tests cover the content (every code problem is solvable, and every buggy
snippet really fails, in both Python and JavaScript), the engine (scoring,
topic status, skip list, gaps, ready-by, the next task), and the full API flow.

## Settings

| Variable | Default | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | none (admin off) | Password for `/admin` |
| `UPI_ID` | none (payments off, free) | Shown on the season screen |
| `PRICE` | `499` | Season price in rupees |
| `TRIAL_DAYS` | `3` | Free days after the first check |
| `DB_PATH` | `data/pillow.db` | SQLite file. Put it on a persistent disk in production |
| `PORT` | `8787` | HTTP port |

## Deploy

Any host that runs a container with a persistent disk works (Railway, Render,
Fly.io). With the Dockerfile:

1. Create a service from the `app/` folder of this repo.
2. Mount a persistent disk at `/data`.
3. Set `ADMIN_PASSWORD` and `UPI_ID`.
4. It serves on port 8080 over the host's HTTPS. Cookies are marked secure
   in production, so it must be served over HTTPS.

Back up `/data/pillow.db` daily. It holds everything.

## How it's built

- `shared/content/`: the 30-topic skill map and 114 checks (88 quick choice
  questions, 18 code problems, 5 find-the-bug snippets, and 3 explanations).
  For choice questions, the right option is always written first and
  shuffled by the server.
- `shared/engine/`: every decision as a plain function: scoring, topic
  status, the skip list, gaps, ready-by, the check path, and today's task.
  The rules follow [concierge/rubric.md](../concierge/rubric.md).
- `server/`: a Hono API on Node's built-in SQLite. The browser never sees
  the answers to choice questions.
- `web/`: React. Code runs in a Web Worker: Python through Pyodide (served
  by the app itself, so blocked CDNs on college Wi-Fi don't matter) and
  JavaScript directly, with a 6-second limit against infinite loops.

## Known limits of the thin version

- **Code is checked in the browser.** The server trusts the pass count it's
  sent. That's fine for self-assessment, but it's not proctoring.
- **Slow solutions pass.** Tests check correctness, not speed, so an O(n²)
  answer can score full marks on a code problem. Approach questions do check
  complexity.
- **Explanations are scored by hand** in admin. Until they're scored, they
  don't affect the result.
- **Payments are UPI plus a manual confirmation.**
- **Reminders are calendar events** the student adds. There's no push, email
  or WhatsApp messaging.
- **Python and JavaScript only.**
- **The ready-by range is a rough formula**, labelled as such, until real
  outcomes come in.
- **No password recovery.** Students sign back in with their private link,
  which admin can resend.
- **The interview-loop destination doesn't yet require a scored
  explanation** before saying "ready".
