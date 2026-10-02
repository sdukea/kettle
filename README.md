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

## Status

**Design phase.** Architecture and plan are in [`docs/`](docs/README.md). Next
step: the [capture spike](docs/12-risks-and-first-task.md#4-exact-first-implementation-task).

## Repository

```
apps/        extension (capture) · web (review) · server (API + worker)   — not yet created
packages/    contracts · analysis · pipeline                              — not yet created
tools/       fake-leetcode dev harness                                    — not yet created
docs/        design documents, ADRs, spikes
```

See [docs/10-repository-and-dev-environment.md](docs/10-repository-and-dev-environment.md)
for the full layout and the reasoning behind it.

## Development

Requirements: macOS, Node 26 (`.nvmrc`), pnpm 12, PostgreSQL 18 (from V1).

```bash
brew install fnm pnpm
fnm install
pnpm install
pnpm check        # lint + typecheck + test
```

| Command | Does |
|---|---|
| `pnpm check` | Everything CI runs |
| `pnpm lint` / `pnpm format` | Biome check / fix |
| `pnpm typecheck` | TypeScript across packages |
| `pnpm test` | Vitest across packages |

More commands arrive with each phase. See the
[build plan](docs/11-build-plan.md).
