# 03 — MVP and Versions

Covers design-doc section **5 (MVP definition)**.

The hypothesis:

> If we automatically reconstruct how someone solved a coding problem, the
> resulting learning record is significantly more useful than manually written
> notes or generic LeetCode explanations.

Every version exists to answer one question. Nothing is built "because we'll
need it later".

---

## V0 — "Is the record any good?" (you, ~3–4 weeks)

**Question answered:** Can we capture a real solving session and turn it into a
record that *you* (the builder, a heavy LeetCode user) find clearly better than
what you'd have written? And which tier of signal is needed?

**Capabilities**
- Unpacked Chrome extension, capture only (Tier 0 + 1 + 2 + context).
- Sessions stored in the extension's IndexedDB. Popup lists sessions with
  **Export JSON** / **Discard**.
- A local CLI: `pnpm nue analyze <session.json>` runs the full pipeline and
  writes a Markdown learning record + a JSON record + a debug trace.
- Ablation flag: `--signal=t0|t01|t012`.
- Fake-LeetCode harness page for deterministic development and tests.

**Technical requirements**
- `packages/contracts` (event + record schemas), `packages/analysis`
  (deterministic stages), `packages/ai` (LLM stages + prompts), `apps/extension`,
  `tools/fake-leetcode`, a CLI in `packages/ai` or `tools/cli`.
- An LLM API key in `.env` (yours).
- **No server, no database, no auth, no web UI.**

**Deliberately excluded**
Backend, accounts, web app, review system, cross-session aggregation, polish,
Chrome Web Store listing.

**Success criteria (write these down before starting)**
1. Capture works on ≥ 95% of 30 real sessions across ≥ 3 languages (Python,
   Java/C++, JS), with no manual fix-ups.
2. **Observed** claims: 100% factually correct. They're rendered from data, so
   anything less is a bug.
3. **Inferred** claims: ≥ 80% rated "correct" or "close" by the solver (you)
   immediately after solving.
4. Blind comparison on 20 problems: for each, your own 10-minute notes vs.
   Nue's record vs. the editorial. Nue's record rated most useful for "what
   would help me re-solve this in 3 weeks" in ≥ 14/20.
5. Ablation: a decision on whether Tier 2 ever needs to leave the device.
6. Cost: ≤ $0.05 LLM spend per session at list prices.

If criterion 3 or 4 fails after two prompt/pipeline iterations, **stop and
rethink** before building a backend. That's the whole point of V0.

---

## V1 — "Will other people use it without us?" (private beta, ~6–8 weeks)

**Question answered:** Will 20–50 real interview-preppers install it, keep it
on, and *read* their records?

**Capabilities**
- Extension: pairing with account, upload of completed session traces (Tier 0+1
  + context; Tier 2 local-only by default), local queue with retry.
- API + worker: ingest, run pipeline in the background, store records.
- Web app: **Home, History, Learning Record (with inline timeline), Settings**.
- Correct-the-record: confirm/reject/edit inferred claims.
- Privacy: consent flow, pause, discard session, retention settings, export
  (JSON + Markdown zip), delete account (hard delete).
- Markdown export per record + bulk. "Copy as Markdown" for Obsidian/Notion paste.
- Time-to-insight + mistake categories stored per session (the data needed for
  V1.5 from day one, even if not yet shown).
- Basic product analytics (no content), error tracking (scrubbed).

**Technical requirements**
`apps/server` (Hono API + pg-boss worker), Postgres, Drizzle migrations, Better
Auth, `apps/web` (React SPA), deploy to one PaaS, Chrome Web Store (unlisted →
public).

**Deliberately excluded**
Review/SRS, mistake profile UI, pattern library, interview mode, Notion/Obsidian
sync, Safari/Firefox, mobile, payments, teams, local LLM.

**Success criteria**
- ≥ 60% of beta users who solve ≥ 3 problems in week 1 are still recording in
  week 3.
- ≥ 50% of records are opened within 24 h of the solve.
- ≥ 30% of opened records get at least one confirm/reject interaction.
- Inferred-claim rejection rate < 20% (from correct-the-record data).
- Pipeline success rate ≥ 98%. p50 time from session end to record ≤ 60 s.
- Zero privacy incidents. No capture reported outside leetcode.com.

---

## V1.5 — "Does it improve retention?" (~6 weeks)

**Question answered:** Does reviewing *your own* journey make you re-solve
faster and more reliably?

**Capabilities**
- **Review queue** with FSRS scheduling. Card types: cue→pattern,
  blind recall ("explain before revealing"), mistake card ("last time you…"),
  complexity justification.
- **Mistake profile**: recurring mistakes shown only with evidence thresholds
  (≥ 3 occurrences across ≥ 3 problems), each linking to the sessions.
- **Personal pattern library**: patterns with your problems as examples, your
  typical time-to-insight, your recurring mistakes within the pattern.
- **Re-solve tracking**: when you solve a problem again, link sessions and show
  the time-to-insight delta.
- Obsidian: "sync to folder" (File System Access API) writes Markdown files.
- Weekly email digest (opt-in).

**Deliberately excluded**
Interview mode, graph visualization, readiness summaries, Notion API.

**Success criteria**
- ≥ 40% of weekly actives complete ≥ 1 review session per week.
- On re-solves of reviewed problems, time-to-insight is lower than the
  first solve in ≥ 70% of cases (vs. a baseline of un-reviewed re-solves).
- Users can name their top recurring mistake unprompted (survey) and agree it's
  accurate.

---

## V2 — "Does it prepare you for the interview?" (open-ended)

**Capabilities (candidates, prioritized by V1.5 data)**
- **Interview mode**: text first, then voice. Explain your solution, answer
  follow-ups, get graded against your own record with evidence-linked
  feedback.
- **Readiness summary**: per topic, evidence (solved, independently derived,
  explained, recurring mistakes, last reviewed). No single score.
- Pattern graph visualization.
- Notion export (official API, OAuth).
- Firefox; Safari (Xcode wrapper app); VS Code extension for local practice.
- Other platforms (NeetCode, HackerRank) through the adapter interface.
- Mistake → drill micro-exercises.
- Monetization (likely a subscription for the review/interview layers, free
  capture + records).

**Success criteria**
Self-reported interview outcomes, retention at 8 weeks, willingness to pay.
