# Skill map

30 topics for coding interviews and online assessments (OAs). **Tier** says
how much a topic matters for the destination; **prerequisites** say what must
be solid before practising it makes sense.

- **Core:** shows up in most OAs and interviews. Must be Solid to be ready.
- **Common:** shows up often. Must be at least Shaky for an OA, Solid for an
  interview loop.
- **Advanced:** occasional. Nice to have; never blocks "ready".

| ID | Topic | Tier | Prerequisites | Checks |
|---|---|---|---|---|
| T01 | Complexity analysis | Core | — | E01, and asked in every A check |
| T02 | Arrays and strings basics | Core | — | C04, C07 |
| T03 | Hashing (sets, maps, counting) | Core | T02 | C01, A02, A03, B02 |
| T04 | Two pointers | Core | T02 | C04, A05, A06, A16 |
| T05 | Sliding window | Core | T03, T04 | C07, A08, B04 |
| T06 | Prefix sums | Common | T02 | A09, B05 |
| T07 | Sorting and custom comparators | Core | T02 | A05, A23 |
| T08 | Stack | Core | T02 | C10 |
| T09 | Monotonic stack | Common | T08 | A11 |
| T10 | Queue and deque | Common | T02 | A19, A26 |
| T11 | Binary search | Core | T02 | C12, A13, B01 |
| T12 | Binary search on the answer | Common | T11 | A14 |
| T13 | Linked lists | Core | T02 | C15, A16, C17 |
| T14 | Recursion | Core | T01 | C18, C27 |
| T15 | Backtracking | Common | T14 | A30 |
| T16 | Trees: DFS traversal | Core | T14 | C18, A20 |
| T17 | Trees: BFS / level order | Core | T10, T16 | A19 |
| T18 | Binary search trees | Common | T11, T16 | A20 |
| T19 | Heaps / priority queues | Core | T07 | A21, A22 |
| T20 | Intervals | Common | T07 | A23 |
| T21 | Greedy | Common | T07 | A06, A23 |
| T22 | Graphs: representation, BFS and DFS | Core | T03, T17 | A25, B03, E02 |
| T23 | Grid traversal | Core | T22 | C24, A26 |
| T24 | Topological sort | Common | T22 | A25 |
| T25 | Union-find | Advanced | T22 | (none in v0; ask as an approach follow-up to C24) |
| T26 | Shortest paths (Dijkstra) | Advanced | T19, T22 | (none in v0) |
| T27 | Dynamic programming: 1-D | Core | T14 | C27, A28, E03 |
| T28 | Dynamic programming: 2-D / knapsack | Common | T27 | A29 |
| T29 | Tries | Advanced | T03, T16 | A31 |
| T30 | Bit manipulation | Advanced | T01 | A32 |

A cross-cutting skill, **choosing a data structure**, is measured by every
approach (A) check: did they pick the right structure *and say why*?

## Destinations: what "ready" means

Agree the destination with each student at intake. Their arrival test is the
row below, adjusted to anything specific they know about their target.

| Destination | Arrival test | Ready when |
|---|---|---|
| **Internship OA** | 2 problems (easy–medium) in 60–90 minutes, auto-graded | All Core topics Solid; Common topics at least Shaky; passes a timed 2-problem mock (score ≥ 2 on both) |
| **Campus placement coding round** | 2–3 problems in 60–90 minutes, often with MCQs | Same as the OA, plus a timed 3-problem mock with at least 2 solved. Aptitude and MCQ sections are **out of scope** for v0; say so |
| **New-grad interview loop** | 2–4 rounds of 45 minutes, live, talking through solutions | All Core and Common topics Solid; explain-aloud checks ≥ 2; passes one 45-minute live mock where you play interviewer |

## Default topic order (when two gaps tie)

Fix the one higher in this list first. It reflects prerequisites and how often
topics appear. T01 and T02 are foundations: if either is a Gap, fix it before
anything else.

T03 → T04 → T05 → T11 → T08 → T13 → T16 → T14 → T07 → T19 → T22 → T23 → T17 →
T27 → T20 → T06 → T09 → T12 → T18 → T21 → T24 → T15 → T28 → T10 → T29 → T30 →
T25 → T26
