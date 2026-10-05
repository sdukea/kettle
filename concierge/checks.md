# Checks

40 short checks. Four types, each designed to measure *unaided* skill
quickly. No AI, no hints during a check: say so at the start.

| Type | What the student does | Time box |
|---|---|---|
| **C** Code | Writes a working solution and runs it on the examples | Easy 8 min, Medium 15 min |
| **A** Approach | Says the approach, the data structure and why, and the time and space complexity. No full code | 4 min |
| **B** Bug | Finds and fixes the bug in a given snippet, and names an input that breaks it | 4 min |
| **E** Explain | Explains a concept out loud as if to a junior | 3 min |

Before every check, ask: **"How confident are you, 1 to 5?"** Log it. The
gap between confidence and score is useful data.

Problem numbers are LeetCode's. Use the free problems only.

## Code (C) and approach (A) checks

| ID | Type | Problem | LC # | Level | Topics | A pass looks like |
|---|---|---|---|---|---|---|
| C01 | C | Two Sum | 1 | Easy | T03 | Hash map of value → index, one pass, O(n) |
| A02 | A | Contains Duplicate | 217 | Easy | T03 | Set, O(n) time, O(n) space; mentions the sort alternative |
| A03 | A | Group Anagrams | 49 | Medium | T03 | Key = sorted word or 26-count tuple; map key → list; O(n·k log k) or O(n·k) |
| C04 | C | Valid Palindrome | 125 | Easy | T02, T04 | Two pointers skipping non-alphanumerics, case-insensitive, O(n), O(1) |
| A05 | A | 3Sum | 15 | Medium | T04, T07 | Sort, fix one, two pointers for the rest, skip duplicates; O(n²) |
| A06 | A | Container With Most Water | 11 | Medium | T04, T21 | Two pointers from both ends; move the shorter side and can say why; O(n) |
| C07 | C | Best Time to Buy and Sell Stock | 121 | Easy | T02, T05 | Track min so far and best profit; O(n), O(1) |
| A08 | A | Longest Substring Without Repeating Characters | 3 | Medium | T05, T03 | Sliding window with last-seen map; left pointer only moves forward; O(n) |
| A09 | A | Product of Array Except Self | 238 | Medium | T06 | Prefix and suffix products, no division; O(n), O(1) extra besides output |
| C10 | C | Valid Parentheses | 20 | Easy | T08 | Stack with matching map; handles leftovers; O(n) |
| A11 | A | Daily Temperatures | 739 | Medium | T09 | Monotonic decreasing stack of indices; O(n) and can say why each index is pushed/popped once |
| C12 | C | Binary Search | 704 | Easy | T11 | Correct bounds and loop condition, no infinite loop; O(log n) |
| A13 | A | Search in Rotated Sorted Array | 33 | Medium | T11 | Binary search, decide which half is sorted each step; O(log n) |
| A14 | A | Koko Eating Bananas | 875 | Medium | T12 | Binary search on speed 1..max(piles), feasibility check; O(n log max) |
| C15 | C | Reverse Linked List | 206 | Easy | T13 | Iterative prev/curr/next; O(n), O(1) |
| A16 | A | Linked List Cycle | 141 | Easy | T13, T04 | Fast and slow pointers; O(n), O(1); mentions the set alternative |
| C17 | C | Merge Two Sorted Lists | 21 | Easy | T13 | Dummy head, splice nodes; O(n+m) |
| C18 | C | Maximum Depth of Binary Tree | 104 | Easy | T14, T16 | Recursive 1 + max(left, right), base case on null |
| A19 | A | Binary Tree Level Order Traversal | 102 | Medium | T17, T10 | Queue, process level by level using the queue size; O(n) |
| A20 | A | Validate Binary Search Tree | 98 | Medium | T18, T16 | Pass (low, high) bounds down, or in-order must be strictly increasing; avoids the "only compare with children" trap |
| A21 | A | Kth Largest Element in an Array | 215 | Medium | T19 | Min-heap of size k, O(n log k); mentions quickselect average O(n) |
| A22 | A | Top K Frequent Elements | 347 | Medium | T19, T03 | Count map + heap of size k, or bucket sort for O(n) |
| A23 | A | Merge Intervals | 56 | Medium | T20, T07 | Sort by start, merge if overlapping; O(n log n) |
| C24 | C | Number of Islands | 200 | Medium | T23, T22 | DFS or BFS from each unvisited land cell, mark visited; O(rows·cols). Follow-up: how would union-find do it? (T25) |
| A25 | A | Course Schedule | 207 | Medium | T24, T22 | Build graph; cycle detection via Kahn's algorithm or DFS colours; O(V+E) |
| A26 | A | Rotting Oranges | 994 | Medium | T23, T10 | Multi-source BFS from all rotten oranges, count minutes by level; check leftovers |
| C27 | C | Climbing Stairs | 70 | Easy | T27, T14 | dp[i] = dp[i-1] + dp[i-2], O(n), O(1) with two variables |
| A28 | A | House Robber | 198 | Medium | T27 | dp[i] = max(dp[i-1], dp[i-2] + nums[i]); states it clearly |
| A29 | A | Coin Change | 322 | Medium | T28 | dp[amount] = min over coins of dp[amount - coin] + 1, unreachable = ∞; O(amount·coins) |
| A30 | A | Subsets | 78 | Medium | T15 | Backtracking include/exclude, or iterative doubling; O(n·2ⁿ) |
| A31 | A | Implement Trie | 208 | Medium | T29 | Node with children map and end flag; insert/search/startsWith in O(word length) |
| A32 | A | Single Number | 136 | Easy | T30 | XOR all numbers; O(n), O(1); can say why it works |

## Find-the-bug (B) checks

Paste the snippet. Ask: "This has one bug. Find it, fix it, and give an input
that breaks the original." All five are verified: each buggy version fails on
the input given, and the fix passes.

### B01 · Binary search (T11)

```python
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid
        else:
            hi = mid
    return lo if nums and nums[lo] == target else -1
```

- **Bug:** `lo = mid` can stop making progress, so the loop never ends.
- **Breaking input:** `nums = [1, 3], target = 3`.
- **Fix:** `lo = mid + 1`.

### B02 · Two Sum, sorted (T03, T07)

```python
def two_sum(nums, target):
    nums = sorted(nums)
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []
```

- **Bug:** sorting loses the original indices, so it returns positions in the
  sorted array.
- **Breaking input:** `nums = [3, 2, 4], target = 6` returns `[0, 2]`; the
  answer is `[1, 2]`.
- **Fix:** a hash map of value → index (or sort `(value, index)` pairs).

### B03 · Counting reachable nodes (T22)

```python
def count_reachable(graph, start):
    count = 0
    def dfs(node):
        nonlocal count
        count += 1
        for nxt in graph[node]:
            dfs(nxt)
    dfs(start)
    return count
```

- **Bug:** no visited set, so cycles recurse forever and shared nodes are
  counted twice.
- **Breaking input:** `graph = {0: [1, 2], 1: [2], 2: [0]}, start = 0`
  (should return 3).
- **Fix:** keep a `seen` set; return early if the node is in it.

### B04 · Longest substring without repeats (T05)

```python
def longest(s):
    seen = {}
    best = start = 0
    for i, ch in enumerate(s):
        if ch in seen:
            start = seen[ch] + 1
        seen[ch] = i
        best = max(best, i - start + 1)
    return best
```

- **Bug:** `start` can jump backwards to before the current window.
- **Breaking input:** `"abba"` returns 3; the answer is 2.
- **Fix:** `start = max(start, seen[ch] + 1)`.

### B05 · Range sums with prefix sums (T06)

```python
def range_sums(nums, queries):
    prefix = [0] * len(nums)
    for i, x in enumerate(nums):
        prefix[i] = prefix[i - 1] + x
    return [prefix[r] - prefix[l] for l, r in queries]
```

Queries are inclusive `(l, r)` pairs.

- **Bug:** `prefix[r] - prefix[l]` drops `nums[l]`.
- **Breaking input:** `nums = [2, 4, 6, 8], queries = [(1, 2)]` returns
  `[6]`; the answer is `[10]`.
- **Fix:** use a prefix array of length `n + 1` with `prefix[0] = 0`, and
  return `prefix[r + 1] - prefix[l]`.

## Explain-aloud (E) checks

| ID | Prompt | Topics | A pass looks like |
|---|---|---|---|
| E01 | "Explain the time and space complexity of your Two Sum solution, and why a hash map lookup is fast." | T01, T03 | O(n) time and space; average O(1) lookup via hashing; mentions the worst case without being prompted for a 3 |
| E02 | "When would you use BFS instead of DFS? Give an example." | T22, T17 | BFS for shortest path in unweighted graphs and level-by-level work; DFS for exhaustive search, cycle detection, topological order; a concrete example |
| E03 | "Using Climbing Stairs, explain what a DP state is and how you find the recurrence." | T27 | Defines state as "ways to reach step i"; derives the recurrence from the last move; mentions base cases and the space optimisation |

## Suggested position-fix path (30 minutes)

Start easy so the first result is a win, then adapt.

1. **C01 Two Sum** (8 min). Almost everyone can pass; it sets the tone.
2. **E01** (3 min), about the solution they just wrote.
3. **B04** or **B02** (4 min).
4. Branch on what you've seen so far:
   - Strong so far → **A08**, then **A19** or **A25**, then **A28**.
   - Struggling → step down: **C04** or **C10**, then **C18**.
5. If time is left, one check in a family you haven't touched (trees, graphs
   or DP), so fewer topics stay Unknown.
