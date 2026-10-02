# Nue

*LeetCode's never been this easy.*

[![CI](https://github.com/sdukea/nue/actions/workflows/ci.yml/badge.svg)](https://github.com/sdukea/nue/actions/workflows/ci.yml)
![Status: design phase](https://img.shields.io/badge/status-design%20phase-orange)
![Platform: macOS + Chrome](https://img.shields.io/badge/platform-macOS%20%2B%20Chrome-lightgrey)

**Solve problems. Nue writes the notes.**

Nue watches *how* you solve coding problems and turns that process into study
material you never had to write.

While you solve on LeetCode, Nue records how your code changes: approaches you
tried and deleted, runs that failed, and the change that finally worked. When
you're done, it rebuilds your path as a learning record: what you tried first,
where you got stuck, the turning point, your mistakes, and what to remember.
Over time those records become a review system built from your own history,
not someone else's editorial.

## How it works

```
 solve on LeetCode  ──►  Nue records code changes + run results  (browser extension)
                                       │
                                       ▼
                          rebuilds your attempts and mistakes    (deterministic analysis)
                                       │
                                       ▼
                          explains what they likely mean         (AI, evidence-checked)
                                       │
                                       ▼
 review what you'd forget  ◄──  your learning record              (web app)
```

What a record looks like (abridged):

> **Two Sum** · Python · solved in 12 min · key insight at 7 min
>
> **Cue:** pair summing to target → remember what you've seen, look up the complement.
>
> **Your journey**
> 1. **Brute force** (0:00–4:10): nested loops, deleted before running.
>    💭 *Likely abandoned because you expected O(n²) to be too slow.* (low confidence)
> 2. **Sort + two pointers** (4:10–7:05): 1 run, wrong answer on `[3,2,4]`.
>    💭 *Sorting reordered `nums`, so the returned indices pointed into the sorted array.* (high confidence)
> 3. **Hashmap complement** (7:05–12:00): accepted.
>
> **Mistake to remember:** you sorted the input and lost the original indices. Second time this month.

Plain lines are things Nue observed directly. Lines marked 💭 are
interpretations. Each one cites evidence from your session, and you can confirm,
reject or edit it.

## Principles

- **Observe, don't assist.** Nue never helps while you're solving. Your
  struggle is the signal.
- **Facts vs. inferences.** What Nue *saw* and what it *thinks it means* are
  always shown separately.
- **Scoped and visible.** Nue runs only on `leetcode.com/problems/*`, never logs
  keystrokes, and always shows when it's recording.

## Privacy

| Nue records | Nue never records |
|---|---|
| Code in the LeetCode editor, as it changes | Keystrokes, cursor position, or your screen |
| Run/submit results (verdicts, errors, failing cases) | Other tabs, other sites, or other apps |
| Problem identity (slug, title, difficulty) | Problem statement text |
| Timing, and whether you opened hints or the editorial | Cookies, login details, or request headers |

Chrome itself enforces that limit: the extension only asks for permission on
`leetcode.com/problems/*`. You can pause, discard any session, export
everything, or delete your account at any time. Details:
[privacy & security](docs/08-privacy-security.md).

## Roadmap

| Stage | Answers | Scope | Status |
|---|---|---|---|
| **Design** | What should we build, and how? | Architecture, data model, privacy model, build plan | ✅ Done |
| **V0** | Is an auto-generated record better than your own notes? | Capture extension + local CLI pipeline, no server | 🔜 Next |
| **V1** | Will other people use it? | Accounts, sync, web app, record + history screens, export | Planned |
| **V1.5** | Does it improve retention? | Spaced review, mistake profile, pattern library, Obsidian/Anki | Planned |
| **V2** | Does it prepare you for interviews? | Interview mode, readiness summaries, more platforms | Later |

The next task is a
[logged-in capture spike](docs/12-risks-and-first-task.md#4-exact-first-implementation-task),
which confirms exactly what LeetCode's run/submit traffic contains. Full plan:
[MVP](docs/03-mvp.md) · [build phases](docs/11-build-plan.md).

## Documentation

The design is in [`docs/`](docs/README.md). Good places to start:

| If you want to know… | Read |
|---|---|
| Why a scoped extension, and why no keylogging | [01 — Capture](docs/01-capture.md) |
| What the product is and isn't | [02 — Product](docs/02-product.md) |
| How the pieces fit together | [04 — Architecture](docs/04-architecture.md) |
| How AI is kept honest | [05 — AI pipeline](docs/05-ai-pipeline.md) · [ADR 0004](docs/adr/0004-observed-vs-inferred.md) |
| What a learning record contains | [07 — Learning record](docs/07-learning-record.md) |
| Decisions that are hard to reverse | [ADRs](docs/adr/README.md) |

## Repository layout

```
apps/
  extension/   Chrome extension that captures solving sessions     (planned)
  web/         web app for reading and reviewing records           (planned)
  server/      API + background worker                             (planned)
packages/
  contracts/   shared schemas: events, traces, records             (planned)
  analysis/    deterministic analysis, runs in browser and server  (planned)
  pipeline/    AI stages, claim validation, evals, CLI             (planned)
tools/
  fake-leetcode/  local LeetCode-like page for dev and tests       (planned)
docs/          design documents, ADRs, spikes
```

The reasoning behind this layout is in
[10 — Repository & dev environment](docs/10-repository-and-dev-environment.md).

## Development

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 26 (pinned in `.nvmrc`) | `brew install fnm && fnm install` |
| pnpm | 12 (pinned in `package.json`) | `brew install pnpm` (Node 25+ no longer ships corepack) |
| PostgreSQL | 18, needed from V1 | `brew install postgresql@18` |

### Setup

```bash
git clone https://github.com/sdukea/nue.git
cd nue
fnm install
pnpm install
cp .env.example .env   # fill in keys as phases need them
pnpm check             # lint + typecheck + test
```

### Commands

| Command | Does |
|---|---|
| `pnpm check` | Everything CI runs; must pass before committing |
| `pnpm lint` / `pnpm format` | Biome check / fix |
| `pnpm typecheck` | TypeScript across packages |
| `pnpm test` | Vitest across packages |

More commands arrive with each phase (`pnpm dev`, `pnpm dev:ext`,
`pnpm nue analyze`, `pnpm eval`). See the
[full list](docs/10-repository-and-dev-environment.md#everyday-commands-root-packagejson).
