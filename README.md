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

- **Observe, don't assist.** Nue never helps you while you're solving.
- **Facts vs. inferences.** What Nue *saw* and what it *thinks it means* are
  always shown separately, and you can correct the latter.
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
