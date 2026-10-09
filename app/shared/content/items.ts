// Every check Pillow can ask. Ported from concierge/checks.md and extended so each
// core and common topic has several fresh checks for daily and weekly use.
//
// Authoring rule for choice questions: the correct option is always listed FIRST.
// The client shuffles options for display and sends back the original index.

export type Level = "easy" | "medium" | "hard";
export type Language = "python" | "javascript";
export type Compare = "exact" | "sorted";

export interface Test { args: unknown[]; expect: unknown }

interface Base { id: string; topics: string[]; level: Level; minutes: number; title: string; lc?: { num: number; slug: string } }

export interface CodeItem extends Base {
  kind: "code";
  prompt: string;
  fn: Record<Language, string>;
  starter: Record<Language, string>;
  tests: Test[];
  compare?: Compare;
}
export interface ApproachItem extends Base { kind: "approach"; prompt: string; structures: string[]; complexities: string[] }
export interface McqItem extends Base { kind: "mcq"; prompt: string; code?: string; options: string[] }
export interface BugItem extends Base {
  kind: "bug";
  fn: Record<Language, string>;
  code: Record<Language, string>;
  /** 1-based line numbers that count as finding the bug, per language. */
  bugLines: Record<Language, number[]>;
  tests: Test[];
  compare?: Compare;
  explanation: string;
}
export interface ExplainItem extends Base { kind: "explain"; prompt: string; rubric: string[] }

export type Item = CodeItem | ApproachItem | McqItem | BugItem | ExplainItem;

const lc = (num: number, slug: string) => ({ num, slug });

function ap(id: string, topics: string[], level: Level, title: string, l: { num: number; slug: string }, prompt: string, structures: string[], complexities: string[]): ApproachItem {
  return { id, kind: "approach", topics, level, minutes: 2, title, lc: l, prompt, structures, complexities };
}

function cx(id: string, code: string, options: string[], prompt = "What is the time complexity?"): McqItem {
  return { id, kind: "mcq", topics: ["T01"], level: "easy", minutes: 1, title: "Complexity", prompt, code, options };
}

// ---------------------------------------------------------------- approach checks
const APPROACH: ApproachItem[] = [
  // T02 arrays and strings
  ap("ap-move-zeroes", ["T02"], "easy", "Move Zeroes", lc(283, "move-zeroes"), "Move every 0 to the end in place, keeping the order of the other numbers.",
    ["One pass with a write index, then fill the rest with 0s", "Sort the array", "Build a new array each time a zero is found", "Store zero positions in a hash map"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-merge-sorted-array", ["T02", "T04"], "easy", "Merge Sorted Array", lc(88, "merge-sorted-array"), "Merge nums2 into nums1 in place. nums1 has empty space at the end.",
    ["Two pointers filling nums1 from the back", "Append nums2, then sort", "Insert each element by shifting the rest", "Count values in a hash map"], ["O(m + n)", "O((m + n) log(m + n))", "O(m · n)"]),
  ap("ap-plus-one", ["T02"], "easy", "Plus One", lc(66, "plus-one"), "A number is stored as an array of digits. Add one to it.",
    ["Walk from the last digit, carrying the 1", "Add 1 to every digit", "Sort the digits", "Recurse from the first digit forwards"], ["O(n)", "O(n log n)", "O(n²)"]),
  // T03 hashing
  ap("ap-contains-duplicate", ["T03"], "easy", "Contains Duplicate", lc(217, "contains-duplicate"), "Return true if any value appears at least twice.",
    ["A set of the numbers seen so far", "Compare every pair", "Binary search for each number", "A stack"], ["O(n)", "O(n²)", "O(log n)"]),
  ap("ap-group-anagrams", ["T03"], "medium", "Group Anagrams", lc(49, "group-anagrams"), "Group words that are anagrams of each other.",
    ["A hash map keyed by each word’s sorted letters", "Compare every pair of words", "Sort the list of words", "A trie of all the words"], ["O(n · k log k)", "O(n² · k)", "O(n log n)"]),
  ap("ap-valid-anagram", ["T03"], "easy", "Valid Anagram", lc(242, "valid-anagram"), "Are two strings anagrams of each other?",
    ["Count letters in a hash map or 26-slot array and compare", "Check every permutation", "Binary search for each letter", "Two stacks"], ["O(n)", "O(n²)", "O(n!)"]),
  ap("ap-longest-consecutive", ["T03"], "medium", "Longest Consecutive Sequence", lc(128, "longest-consecutive-sequence"), "Find the length of the longest run of consecutive integers, in O(n).",
    ["Put every number in a set; only count upwards from numbers with no left neighbour", "Sort, then scan", "Compare every pair", "A min-heap of all numbers"], ["O(n)", "O(n log n)", "O(n²)"]),
  // T04 two pointers
  ap("ap-3sum", ["T04", "T07"], "medium", "3Sum", lc(15, "3sum"), "Find all unique triplets that sum to zero.",
    ["Sort, fix one number, then two pointers on the rest", "Three nested loops", "A hash map of every pair", "Binary search for the third number"], ["O(n²)", "O(n³)", "O(n log n)"]),
  ap("ap-container-water", ["T04", "T21"], "medium", "Container With Most Water", lc(11, "container-with-most-water"), "Pick two lines that hold the most water.",
    ["Two pointers from both ends; move the shorter side inwards", "Check every pair of lines", "Sort the heights", "A monotonic stack"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-two-sum-ii", ["T04"], "medium", "Two Sum II (sorted input)", lc(167, "two-sum-ii-input-array-is-sorted"), "The array is sorted. Find two numbers that add to the target using constant extra space.",
    ["Two pointers from both ends", "A hash map of numbers seen", "Check every pair", "Sort again, then scan"], ["O(n)", "O(n log n)", "O(n²)"]),
  // T05 sliding window
  ap("ap-longest-substring", ["T05", "T03"], "medium", "Longest Substring Without Repeating Characters", lc(3, "longest-substring-without-repeating-characters"), "Find the length of the longest substring with no repeated characters.",
    ["A sliding window with a map of last-seen positions", "Check every substring", "Sort the characters", "A stack of characters"], ["O(n)", "O(n²)", "O(n³)"]),
  ap("ap-char-replacement", ["T05"], "medium", "Longest Repeating Character Replacement", lc(424, "longest-repeating-character-replacement"), "You may change up to k letters. Find the longest run of one letter you can make.",
    ["A sliding window tracking the most frequent letter inside it", "Try every substring and count the changes", "Sort the string", "A min-heap of letters"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-permutation-in-string", ["T05", "T03"], "medium", "Permutation in String", lc(567, "permutation-in-string"), "Does s2 contain any permutation of s1?",
    ["A fixed-size window whose letter counts are compared with s1’s", "Generate every permutation of s1", "Sort every substring of s2", "A trie of s1’s permutations"], ["O(n)", "O(n · m log m)", "O(m! · n)"]),
  // T06 prefix sums
  ap("ap-product-except-self", ["T06"], "medium", "Product of Array Except Self", lc(238, "product-of-array-except-self"), "For each index, the product of every other number, without division.",
    ["Prefix products from the left times suffix products from the right", "Divide the total product by each number", "Multiply everything else for each index", "Sort, then multiply"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-subarray-sum-k", ["T06", "T03"], "medium", "Subarray Sum Equals K", lc(560, "subarray-sum-equals-k"), "Count subarrays that sum to k. Numbers can be negative.",
    ["A running prefix sum with a hash map counting earlier sums", "Check every subarray", "A sliding window", "Sort, then two pointers"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-range-sum", ["T06"], "easy", "Range Sum Query", lc(303, "range-sum-query-immutable"), "Answer many sum(left, right) queries on a fixed array.",
    ["Precompute prefix sums once", "Loop over the range for each query", "Sort the array first", "A hash map of every possible range"], ["O(1) per query after O(n) setup", "O(n) per query", "O(log n) per query"]),
  // T07 sorting
  ap("ap-largest-number", ["T07"], "medium", "Largest Number", lc(179, "largest-number"), "Arrange numbers to form the largest possible number.",
    ["Sort with a custom comparator: a before b if a+b > b+a as strings", "Sort the numbers in descending order", "Try every arrangement", "A max-heap of single digits"], ["O(n log n)", "O(n!)", "O(n)"]),
  ap("ap-sort-colors", ["T07", "T04"], "medium", "Sort Colors", lc(75, "sort-colors"), "Sort an array of 0s, 1s and 2s in one pass, in place.",
    ["Three pointers: low, mid and high", "The built-in sort", "Count each colour, then rewrite in a second pass", "Bubble sort"], ["O(n)", "O(n log n)", "O(n²)"]),
  // T08 stack
  ap("ap-valid-parentheses", ["T08"], "easy", "Valid Parentheses", lc(20, "valid-parentheses"), "Are the brackets in a string balanced and correctly nested?",
    ["A stack of open brackets", "Count each bracket type", "Recurse on substrings", "Two pointers from both ends"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-min-stack", ["T08"], "medium", "Min Stack", lc(155, "min-stack"), "A stack that can also return its minimum in constant time.",
    ["Store each value together with the minimum so far", "Scan the stack for the minimum each time", "Keep the stack sorted", "A min-heap beside the stack"], ["O(1) per operation", "O(n) for getMin", "O(log n) per operation"]),
  ap("ap-rpn", ["T08"], "medium", "Evaluate Reverse Polish Notation", lc(150, "evaluate-reverse-polish-notation"), "Evaluate an expression like [\"2\",\"1\",\"+\",\"3\",\"*\"].",
    ["A stack of numbers; each operator applies to the top two", "Recurse from the left", "A queue", "Two pointers"], ["O(n)", "O(n²)", "O(n log n)"]),
  // T09 monotonic stack
  ap("ap-daily-temperatures", ["T09"], "medium", "Daily Temperatures", lc(739, "daily-temperatures"), "For each day, how many days until a warmer one?",
    ["A stack of indices with decreasing temperatures", "For each day, scan forwards", "Sort the temperatures", "A max-heap"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-next-greater", ["T09", "T03"], "easy", "Next Greater Element I", lc(496, "next-greater-element-i"), "For each number in nums1, find the next greater number to its right in nums2.",
    ["A monotonic stack over nums2, storing answers in a hash map", "For each number, scan nums2 to the right", "Sort nums2", "Binary search in nums2"], ["O(n + m)", "O(n · m)", "O(m log m)"]),
  ap("ap-histogram", ["T09"], "hard", "Largest Rectangle in Histogram", lc(84, "largest-rectangle-in-histogram"), "Find the largest rectangle under the bars.",
    ["A stack of bar indices with increasing heights", "Check every pair of bars", "Sort the bars by height", "Split at the tallest bar and recurse"], ["O(n)", "O(n²)", "O(n log n)"]),
  // T10 queue and deque
  ap("ap-sliding-window-max", ["T10", "T05"], "hard", "Sliding Window Maximum", lc(239, "sliding-window-maximum"), "The maximum of every window of size k.",
    ["A deque of indices with decreasing values", "Scan each window for its maximum", "Sort each window", "A hash map of counts in the window"], ["O(n)", "O(n · k)", "O(n · k log k)"]),
  ap("ap-queue-stacks", ["T10", "T08"], "easy", "Implement Queue using Stacks", lc(232, "implement-queue-using-stacks"), "Build a first-in-first-out queue from stacks.",
    ["Two stacks: push onto one, pop from the other, refilling it only when it’s empty", "One array, shifting everything on each pop", "A single stack reversed on every push", "A hash map of positions"], ["Amortised O(1) per operation", "O(n) per pop", "O(log n) per operation"]),
  ap("ap-recent-calls", ["T10"], "easy", "Number of Recent Calls", lc(933, "number-of-recent-calls"), "Count calls in the last 3000 ms each time a new one arrives.",
    ["A queue; drop calls older than 3000 ms from the front", "Store every call and count the range each time", "A sorted array with insertion", "A stack"], ["Amortised O(1) per call", "O(n) per call", "O(log n) per call"]),
  // T11 binary search
  ap("ap-search-rotated", ["T11"], "medium", "Search in Rotated Sorted Array", lc(33, "search-in-rotated-sorted-array"), "Find a target in a sorted array that has been rotated.",
    ["Binary search, deciding which half is sorted at each step", "Scan the whole array", "Find the rotation point, then sort", "A hash map of value to index"], ["O(log n)", "O(n)", "O(n log n)"]),
  ap("ap-find-min-rotated", ["T11"], "medium", "Find Minimum in Rotated Sorted Array", lc(153, "find-minimum-in-rotated-sorted-array"), "Find the smallest element of a rotated sorted array.",
    ["Binary search comparing the middle with the right end", "Scan for the drop", "Sort, then take the first", "A min-heap"], ["O(log n)", "O(n)", "O(n log n)"]),
  ap("ap-search-2d", ["T11"], "medium", "Search a 2D Matrix", lc(74, "search-a-2d-matrix"), "Rows are sorted and each row starts after the previous one ends. Find a target.",
    ["Binary search treating the matrix as one sorted list", "Scan every cell", "BFS from the top-left", "A hash set of all values"], ["O(log(m · n))", "O(m · n)", "O(m + n)"]),
  // T12 binary search on the answer
  ap("ap-koko", ["T12"], "medium", "Koko Eating Bananas", lc(875, "koko-eating-bananas"), "Find the slowest eating speed that finishes all piles within h hours.",
    ["Binary search on the speed, checking whether it finishes in time", "Try every speed from 1 upwards", "Sort the piles", "Greedy: eat the biggest pile first"], ["O(n log max)", "O(n · max)", "O(n log n)"]),
  ap("ap-ship-capacity", ["T12"], "medium", "Capacity To Ship Packages Within D Days", lc(1011, "capacity-to-ship-packages-within-d-days"), "Find the smallest ship capacity that ships everything in order within D days.",
    ["Binary search on the capacity, simulating the days for each guess", "Try every capacity", "Sort the weights", "Greedy: ship the heaviest first"], ["O(n log sum)", "O(n · sum)", "O(n log n)"]),
  // T13 linked lists
  ap("ap-reverse-list", ["T13"], "easy", "Reverse Linked List", lc(206, "reverse-linked-list"), "Reverse a singly linked list using constant extra space.",
    ["Walk the list, pointing each node back at the previous one", "Copy values into an array and rebuild", "Sort the nodes", "A hash map of node to index"], ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n log n) time"]),
  ap("ap-list-cycle", ["T13", "T04"], "easy", "Linked List Cycle", lc(141, "linked-list-cycle"), "Does the list loop back on itself? Use constant memory.",
    ["Fast and slow pointers", "Count steps until 10,000", "Sort the nodes", "Reverse the list"], ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time"]),
  ap("ap-remove-nth", ["T13", "T04"], "medium", "Remove Nth Node From End of List", lc(19, "remove-nth-node-from-end-of-list"), "Remove the n-th node from the end in one pass.",
    ["Two pointers n apart, then move both together", "Reverse, remove, reverse back", "Count the length again for every step", "A stack of every value"], ["O(n), one pass", "O(n²)", "O(n log n)"]),
  ap("ap-merge-two-lists", ["T13"], "easy", "Merge Two Sorted Lists", lc(21, "merge-two-sorted-lists"), "Merge two sorted linked lists into one.",
    ["A dummy head, attaching the smaller node at each step", "Concatenate, then sort", "Copy values into an array and rebuild", "A max-heap"], ["O(n + m)", "O((n + m) log(n + m))", "O(n · m)"]),
  // T14 recursion
  ap("ap-pow", ["T14"], "medium", "Pow(x, n)", lc(50, "powx-n"), "Compute x to the power n.",
    ["Recursion that halves n: x^n = (x^(n/2))²", "Multiply x by itself n times", "Binary search on the answer", "A lookup table"], ["O(log n)", "O(n)", "O(n²)"]),
  ap("ap-fib", ["T14", "T27"], "easy", "Fibonacci Number", lc(509, "fibonacci-number"), "Compute the n-th Fibonacci number.",
    ["Recursion with memoisation, or two variables", "Plain recursion without caching", "Sort the sequence", "A stack of calls"], ["O(n)", "O(2ⁿ)", "O(n²)"]),
  ap("ap-climbing-stairs", ["T27", "T14"], "easy", "Climbing Stairs", lc(70, "climbing-stairs"), "You can climb 1 or 2 steps. How many ways to reach step n?",
    ["ways(i) = ways(i−1) + ways(i−2)", "Plain recursion trying every sequence", "Greedy: take 2 steps whenever possible", "Sort the step sizes"], ["O(n)", "O(2ⁿ)", "O(n²)"]),
  // T15 backtracking
  ap("ap-subsets", ["T15"], "medium", "Subsets", lc(78, "subsets"), "Return every subset of a set of distinct numbers.",
    ["Backtracking: include or skip each number", "Sort, then two pointers", "Greedy", "A hash map of sums"], ["O(n · 2ⁿ)", "O(n²)", "O(n!)"]),
  ap("ap-permutations", ["T15"], "medium", "Permutations", lc(46, "permutations"), "Return every ordering of a list of distinct numbers.",
    ["Backtracking, choosing an unused number for each position", "Sort and reverse", "Nested loops", "A hash map of prefixes"], ["O(n · n!)", "O(2ⁿ)", "O(n³)"]),
  ap("ap-combination-sum", ["T15"], "medium", "Combination Sum", lc(39, "combination-sum"), "Find every combination of candidates (reusable) that sums to the target.",
    ["Backtracking with a running total, allowing the current number again", "Greedy: take the biggest number first", "Two pointers", "Sort and binary search"], ["Exponential in the target", "O(n²)", "O(n log n)"]),
  ap("ap-word-search", ["T15", "T23"], "medium", "Word Search", lc(79, "word-search"), "Does a word exist in a letter grid, moving between neighbouring cells?",
    ["DFS from each cell with backtracking, marking cells in use", "BFS from the first letter only", "A hash map of letter counts", "Sort each row"], ["O(m · n · 3^L)", "O(m · n)", "O(L log L)"]),
  // T16 trees (DFS)
  ap("ap-max-depth", ["T16", "T14"], "easy", "Maximum Depth of Binary Tree", lc(104, "maximum-depth-of-binary-tree"), "How deep is a binary tree?",
    ["Recursion: 1 + the larger depth of the two subtrees", "Count all the nodes", "Sort the values", "Walk only the left children"], ["O(n)", "O(n log n)", "O(2ⁿ)"]),
  ap("ap-invert-tree", ["T16"], "easy", "Invert Binary Tree", lc(226, "invert-binary-tree"), "Mirror a binary tree.",
    ["Recursively swap each node’s left and right children", "Sort the values and rebuild", "Reverse an in-order list of values", "A hash map of parents"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-diameter", ["T16"], "easy", "Diameter of Binary Tree", lc(543, "diameter-of-binary-tree"), "The longest path between any two nodes.",
    ["DFS returning height; at each node track left height + right height", "BFS from every node", "Sort the leaf depths", "Count all edges"], ["O(n)", "O(n²)", "O(n log n)"]),
  // T17 trees (BFS)
  ap("ap-level-order", ["T17", "T10"], "medium", "Binary Tree Level Order Traversal", lc(102, "binary-tree-level-order-traversal"), "Return the values level by level.",
    ["A queue, processing one level at a time using its size", "Recursion that prints as it goes", "Sort the nodes by value", "A stack"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-right-view", ["T17"], "medium", "Binary Tree Right Side View", lc(199, "binary-tree-right-side-view"), "What you see looking at the tree from the right.",
    ["BFS level by level, keeping the last node of each level", "Follow right children only", "Sort nodes by depth", "A max-heap of values"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-min-depth", ["T17"], "easy", "Minimum Depth of Binary Tree", lc(111, "minimum-depth-of-binary-tree"), "The shortest path from the root to a leaf.",
    ["BFS, stopping at the first leaf", "Sort the leaf depths", "Take the minimum of both children even when one is missing", "Count nodes on the left side"], ["O(n)", "O(n log n)", "O(n²)"]),
  // T18 binary search trees
  ap("ap-validate-bst", ["T18", "T16"], "medium", "Validate Binary Search Tree", lc(98, "validate-binary-search-tree"), "Is this a valid binary search tree?",
    ["Pass allowed (low, high) bounds down the tree", "Check each node only against its two children", "Sort the values and compare", "BFS comparing neighbouring levels"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-kth-smallest-bst", ["T18"], "medium", "Kth Smallest Element in a BST", lc(230, "kth-smallest-element-in-a-bst"), "Find the k-th smallest value.",
    ["In-order traversal, stopping at the k-th node", "Collect every value and sort", "BFS", "A max-heap of every value"], ["O(h + k)", "O(n log n)", "O(n²)"]),
  ap("ap-lca-bst", ["T18"], "medium", "Lowest Common Ancestor of a BST", lc(235, "lowest-common-ancestor-of-a-binary-search-tree"), "The lowest node that has both p and q as descendants.",
    ["Walk down from the root, using the values to choose a side", "Store every node’s parent, then compare ancestor lists", "BFS over the whole tree", "Sort the nodes"], ["O(h)", "O(n log n)", "O(n²)"]),
  // T19 heaps
  ap("ap-kth-largest", ["T19"], "medium", "Kth Largest Element in an Array", lc(215, "kth-largest-element-in-an-array"), "Find the k-th largest number.",
    ["A min-heap holding the k largest so far", "Compare each number with every other", "A stack", "Binary search on the index"], ["O(n log k)", "O(n²)", "O(k)"]),
  ap("ap-top-k-frequent", ["T19", "T03"], "medium", "Top K Frequent Elements", lc(347, "top-k-frequent-elements"), "The k most frequent numbers.",
    ["Count with a hash map, then a heap of size k", "Sort the input", "Compare every pair", "A stack of counts"], ["O(n log k)", "O(n²)", "O(k)"]),
  ap("ap-last-stone", ["T19"], "easy", "Last Stone Weight", lc(1046, "last-stone-weight"), "Repeatedly smash the two heaviest stones together.",
    ["A max-heap; take the two heaviest each round", "Sort once and pair neighbours", "A queue", "Two pointers"], ["O(n log n)", "O(n)", "O(n³)"]),
  ap("ap-median-stream", ["T19"], "hard", "Find Median from Data Stream", lc(295, "find-median-from-data-stream"), "Add numbers one by one and report the median at any time.",
    ["Two heaps: a max-heap for the low half and a min-heap for the high half", "Keep a list and sort it on every query", "A single min-heap", "A hash map of counts"], ["O(log n) to add, O(1) to query", "O(n log n) per query", "O(n) to add"]),
  // T20 intervals
  ap("ap-merge-intervals", ["T20", "T07"], "medium", "Merge Intervals", lc(56, "merge-intervals"), "Merge all overlapping intervals.",
    ["Sort by start, then merge each interval into the previous if they overlap", "Compare every pair of intervals", "A hash map of start times", "Binary search for each interval"], ["O(n log n)", "O(n²)", "O(n)"]),
  ap("ap-insert-interval", ["T20"], "medium", "Insert Interval", lc(57, "insert-interval"), "Insert a new interval into a sorted, non-overlapping list.",
    ["One pass: add the ones before, merge the overlaps, add the ones after", "Append, sort, then merge everything", "Binary search alone", "A stack"], ["O(n)", "O(n log n)", "O(n²)"]),
  ap("ap-non-overlapping", ["T20", "T21"], "medium", "Non-overlapping Intervals", lc(435, "non-overlapping-intervals"), "Remove the fewest intervals so the rest don’t overlap.",
    ["Sort by end time; keep each interval that starts after the last kept one ends", "Sort by start and remove the longest", "Try every subset", "Compare every pair"], ["O(n log n)", "O(2ⁿ)", "O(n²)"]),
  // T21 greedy
  ap("ap-jump-game", ["T21"], "medium", "Jump Game", lc(55, "jump-game"), "Can you reach the last index?",
    ["Track the farthest reachable index in one pass", "Try every jump with recursion", "Sort the jump lengths", "Check every pair of indices"], ["O(n)", "O(2ⁿ)", "O(n log n)"]),
  ap("ap-max-subarray", ["T21", "T27"], "medium", "Maximum Subarray", lc(53, "maximum-subarray"), "The largest sum of any contiguous subarray.",
    ["Kadane’s algorithm: extend the current run or restart at each number", "Check every subarray", "Sort and add the positives", "Binary search"], ["O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-gas-station", ["T21"], "medium", "Gas Station", lc(134, "gas-station"), "Which station lets you drive around the whole circuit?",
    ["One pass tracking the tank; restart after any point where it goes negative", "Simulate from every station", "Sort stations by gas", "Binary search on the start"], ["O(n)", "O(n²)", "O(n log n)"]),
  // T22 graphs
  ap("ap-clone-graph", ["T22", "T03"], "medium", "Clone Graph", lc(133, "clone-graph"), "Deep-copy a connected graph.",
    ["DFS or BFS with a map from each old node to its copy", "Copy the nodes and ignore neighbours", "Sort nodes by value", "Union-find"], ["O(V + E)", "O(V²)", "O(V log V)"]),
  ap("ap-path-exists", ["T22"], "easy", "Find if Path Exists in Graph", lc(1971, "find-if-path-exists-in-graph"), "Is there a path from source to destination?",
    ["BFS or DFS from the source with a visited set", "Check every possible path", "Sort the edges", "Compare node values"], ["O(V + E)", "O(V!)", "O(E log E)"]),
  ap("ap-keys-rooms", ["T22"], "medium", "Keys and Rooms", lc(841, "keys-and-rooms"), "Starting in room 0, can you open every room?",
    ["DFS from room 0 with a visited set", "Open the rooms in number order", "Sort the keys", "A min-heap of rooms"], ["O(rooms + keys)", "O(rooms²)", "O(rooms log rooms)"]),
  // T23 grids
  ap("ap-islands", ["T23", "T22"], "medium", "Number of Islands", lc(200, "number-of-islands"), "Count the islands of '1's in a grid.",
    ["DFS or BFS from each unvisited land cell, marking cells as visited", "Count all the '1's", "Sort each row", "Look only at each cell’s right neighbour"], ["O(rows × cols)", "O((rows × cols)²)", "O(rows + cols)"]),
  ap("ap-rotting-oranges", ["T23", "T10"], "medium", "Rotting Oranges", lc(994, "rotting-oranges"), "How many minutes until every orange is rotten?",
    ["BFS from all rotten oranges at once, one level per minute", "DFS from each fresh orange", "Sort the oranges by position", "Count rotten oranges per row"], ["O(rows × cols)", "O((rows × cols)²)", "O(rows + cols)"]),
  ap("ap-max-area-island", ["T23"], "medium", "Max Area of Island", lc(695, "max-area-of-island"), "The size of the largest island.",
    ["DFS from each land cell, counting cells as you mark them", "Count '1's in each row", "BFS from the top-left corner only", "Sort the islands by size"], ["O(rows × cols)", "O((rows × cols)²)", "O(rows + cols)"]),
  ap("ap-flood-fill", ["T23"], "easy", "Flood Fill", lc(733, "flood-fill"), "Recolour the connected area around a starting pixel.",
    ["DFS or BFS from the start over same-coloured neighbours", "Recolour every pixel of that colour anywhere", "Sort the pixels", "Binary search"], ["O(rows × cols)", "O((rows × cols)²)", "O(1)"]),
  // T24 topological sort
  ap("ap-course-schedule", ["T24", "T22"], "medium", "Course Schedule", lc(207, "course-schedule"), "Can you finish every course given the prerequisites?",
    ["Build the graph; detect a cycle with Kahn’s algorithm or DFS", "Take courses in number order", "Sort the prerequisites", "Count prerequisites per course only"], ["O(V + E)", "O(V²)", "O(E log E)"]),
  ap("ap-course-schedule-ii", ["T24"], "medium", "Course Schedule II", lc(210, "course-schedule-ii"), "Return an order in which to take all courses.",
    ["Kahn’s algorithm: repeatedly take a course with no prerequisites left", "Sort by course number", "DFS without tracking which nodes are in progress", "A max-heap of prerequisites"], ["O(V + E)", "O(V log V)", "O(V²)"]),
  // T25–T30 advanced
  ap("ap-redundant-connection", ["T25"], "medium", "Redundant Connection", lc(684, "redundant-connection"), "Find the edge that turned a tree into a graph with a cycle.",
    ["Union-find: the first edge that joins two already-connected nodes", "Remove each edge and run DFS", "Sort the edges", "BFS from node 1"], ["Nearly O(n)", "O(n²)", "O(n log n)"]),
  ap("ap-network-delay", ["T26", "T19"], "medium", "Network Delay Time", lc(743, "network-delay-time"), "How long until a signal reaches every node?",
    ["Dijkstra with a min-heap from the source", "BFS ignoring the weights", "Try every path", "Sort the edges by weight"], ["O(E log V)", "O(V + E)", "O(V!)"]),
  ap("ap-house-robber", ["T27"], "medium", "House Robber", lc(198, "house-robber"), "Rob houses for the most money without robbing two neighbours.",
    ["DP: best(i) = max(best(i−1), best(i−2) + this house)", "Rob every other house", "Greedy: rob the richest house first", "Sort the houses"], ["O(n)", "O(2ⁿ)", "O(n log n)"]),
  ap("ap-decode-ways", ["T27"], "medium", "Decode Ways", lc(91, "decode-ways"), "Count the ways to decode a digit string where A=1 … Z=26.",
    ["DP over positions, adding one-digit and two-digit steps", "Try every split with plain recursion", "Greedy: always take two digits", "Sort the digits"], ["O(n)", "O(2ⁿ)", "O(n²)"]),
  ap("ap-min-cost-stairs", ["T27"], "easy", "Min Cost Climbing Stairs", lc(746, "min-cost-climbing-stairs"), "The cheapest way to the top, paying each step’s cost.",
    ["DP: cost to reach step i from the cheaper of the two steps below", "Always take two steps", "Greedy: take the cheaper next step", "Sort the costs"], ["O(n)", "O(2ⁿ)", "O(n log n)"]),
  ap("ap-coin-change", ["T28"], "medium", "Coin Change", lc(322, "coin-change"), "The fewest coins that make up an amount.",
    ["DP over amounts: fewest coins for every amount up to the target", "Greedy: biggest coin first", "Try every combination", "Sort the coins and binary search"], ["O(amount × coins)", "O(coins^amount)", "O(amount log amount)"]),
  ap("ap-unique-paths", ["T28"], "medium", "Unique Paths", lc(62, "unique-paths"), "Paths from the top-left to the bottom-right moving only right or down.",
    ["2-D DP: paths to a cell = paths from above + paths from the left", "DFS through every path", "Greedy: go right first", "BFS counting levels"], ["O(m × n)", "O(2^(m + n))", "O(m² × n²)"]),
  ap("ap-lcs", ["T28"], "medium", "Longest Common Subsequence", lc(1143, "longest-common-subsequence"), "The longest subsequence two strings share.",
    ["A 2-D DP table over both strings’ prefixes", "Try every subsequence of the first string", "Two pointers", "Sort both strings"], ["O(m × n)", "O(2^m × n)", "O(m + n)"]),
  ap("ap-partition-equal", ["T28"], "medium", "Partition Equal Subset Sum", lc(416, "partition-equal-subset-sum"), "Can the numbers split into two groups with equal sums?",
    ["0/1 knapsack DP over reachable sums up to half the total", "Greedy: add each number to the smaller pile", "Sort, then two pointers", "Try every subset"], ["O(n × sum)", "O(n log n)", "O(2ⁿ)"]),
  ap("ap-trie", ["T29"], "medium", "Implement Trie", lc(208, "implement-trie-prefix-tree"), "Insert words and search for words and prefixes.",
    ["Nodes with a children map and an end-of-word flag", "A sorted list with binary search", "A hash set of whole words only", "A heap"], ["O(word length) per operation", "O(n log n) per operation", "O(n × word length) per operation"]),
  ap("ap-single-number", ["T30"], "easy", "Single Number", lc(136, "single-number"), "Every number appears twice except one. Find it with constant extra space.",
    ["XOR all the numbers together", "Sort and compare neighbours", "A hash map of counts", "Nested loops"], ["O(n) time, O(1) space", "O(n log n) time", "O(n) time, O(n) space"]),
  ap("ap-count-bits", ["T30"], "easy", "Number of 1 Bits", lc(191, "number-of-1-bits"), "Count the 1 bits in an integer.",
    ["Repeatedly clear the lowest set bit with n & (n − 1)", "Divide by 10 and count", "Binary search", "Sort the bits"], ["O(number of 1 bits)", "O(n²)", "O(log₁₀ n)"]),
];

// ---------------------------------------------------------------- complexity questions
const MCQ: McqItem[] = [
  cx("cx-nested", "for i in range(n):\n    for j in range(i, n):\n        total += 1", ["O(n²)", "O(n)", "O(n log n)", "O(2ⁿ)"]),
  cx("cx-halving", "while n > 1:\n    n //= 2", ["O(log n)", "O(n)", "O(1)", "O(√n)"]),
  cx("cx-two-pointer", "i, j = 0, len(a) - 1\nwhile i < j:\n    if a[i] + a[j] < t:\n        i += 1\n    else:\n        j -= 1", ["O(n)", "O(n²)", "O(log n)", "O(n log n)"]),
  cx("cx-list-membership", "# a has n items, b is a list with m items\nfor x in a:\n    if x in b:\n        count += 1", ["O(n · m)", "O(n)", "O(n + m)", "O(n log m)"]),
  cx("cx-sort-then-loop", "a.sort()\nfor x in a:\n    print(x)", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"]),
];

// ---------------------------------------------------------------- code checks
function code(id: string, topics: string[], level: Level, title: string, l: { num: number; slug: string }, prompt: string, py: string, js: string, params: string, tests: Test[], compare: Compare = "exact"): CodeItem {
  return {
    id, kind: "code", topics, level, minutes: level === "easy" ? 8 : 15, title, lc: l, prompt,
    fn: { python: py, javascript: js },
    starter: {
      python: `def ${py}(${params}):\n    pass\n`,
      javascript: `function ${js}(${params.split(",").map((p) => p.trim().replace(/_(\w)/g, (_, c) => c.toUpperCase())).join(", ")}) {\n\n}\n`,
    },
    tests, compare,
  };
}

const CODE: CodeItem[] = [
  code("code-two-sum", ["T03"], "easy", "Two Sum", lc(1, "two-sum"), "Return the indices of the two numbers that add up to target. Exactly one answer exists, and you can’t use the same element twice.",
    "two_sum", "twoSum", "nums, target", [
      { args: [[2, 7, 11, 15], 9], expect: [0, 1] }, { args: [[3, 2, 4], 6], expect: [1, 2] }, { args: [[3, 3], 6], expect: [0, 1] },
      { args: [[-1, -2, -3, -4, -5], -8], expect: [2, 4] }, { args: [[0, 4, 3, 0], 0], expect: [0, 3] },
    ], "sorted"),
  code("code-valid-palindrome", ["T04", "T02"], "easy", "Valid Palindrome", lc(125, "valid-palindrome"), "Ignoring case and anything that isn’t a letter or digit, does the string read the same both ways?",
    "is_palindrome", "isPalindrome", "s", [
      { args: ["A man, a plan, a canal: Panama"], expect: true }, { args: ["race a car"], expect: false }, { args: [" "], expect: true },
      { args: ["0P"], expect: false }, { args: ["ab_a"], expect: true },
    ]),
  code("code-max-profit", ["T02", "T05"], "easy", "Best Time to Buy and Sell Stock", lc(121, "best-time-to-buy-and-sell-stock"), "Buy on one day and sell on a later day. Return the largest profit, or 0.",
    "max_profit", "maxProfit", "prices", [
      { args: [[7, 1, 5, 3, 6, 4]], expect: 5 }, { args: [[7, 6, 4, 3, 1]], expect: 0 }, { args: [[2, 4, 1]], expect: 2 },
      { args: [[1]], expect: 0 }, { args: [[3, 3, 5, 0, 0, 3, 1, 4]], expect: 4 },
    ]),
  code("code-valid-parentheses", ["T08"], "easy", "Valid Parentheses", lc(20, "valid-parentheses"), "Given a string of ()[]{} characters, are the brackets balanced and correctly nested?",
    "is_valid", "isValid", "s", [
      { args: ["()"], expect: true }, { args: ["()[]{}"], expect: true }, { args: ["(]"], expect: false }, { args: ["([)]"], expect: false },
      { args: ["{[]}"], expect: true }, { args: ["("], expect: false }, { args: ["]"], expect: false },
    ]),
  code("code-binary-search", ["T11"], "easy", "Binary Search", lc(704, "binary-search"), "nums is sorted ascending. Return the index of target, or -1. Aim for O(log n).",
    "search", "search", "nums, target", [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expect: 4 }, { args: [[-1, 0, 3, 5, 9, 12], 2], expect: -1 }, { args: [[5], 5], expect: 0 },
      { args: [[1, 3], 3], expect: 1 }, { args: [[1, 3], 0], expect: -1 },
    ]),
  code("code-climb-stairs", ["T27", "T14"], "easy", "Climbing Stairs", lc(70, "climbing-stairs"), "You can climb 1 or 2 steps at a time. How many distinct ways are there to reach step n?",
    "climb_stairs", "climbStairs", "n", [
      { args: [1], expect: 1 }, { args: [2], expect: 2 }, { args: [3], expect: 3 }, { args: [5], expect: 8 }, { args: [10], expect: 89 }, { args: [45], expect: 1836311903 },
    ]),
  code("code-contains-duplicate", ["T03"], "easy", "Contains Duplicate", lc(217, "contains-duplicate"), "Return true if any value appears at least twice.",
    "contains_duplicate", "containsDuplicate", "nums", [
      { args: [[1, 2, 3, 1]], expect: true }, { args: [[1, 2, 3, 4]], expect: false }, { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expect: true }, { args: [[]], expect: false },
    ]),
  code("code-valid-anagram", ["T03"], "easy", "Valid Anagram", lc(242, "valid-anagram"), "Return true if t is an anagram of s.",
    "is_anagram", "isAnagram", "s, t", [
      { args: ["anagram", "nagaram"], expect: true }, { args: ["rat", "car"], expect: false }, { args: ["a", "ab"], expect: false }, { args: ["", ""], expect: true },
    ]),
  code("code-single-number", ["T30"], "easy", "Single Number", lc(136, "single-number"), "Every number appears twice except one. Return it.",
    "single_number", "singleNumber", "nums", [
      { args: [[2, 2, 1]], expect: 1 }, { args: [[4, 1, 2, 1, 2]], expect: 4 }, { args: [[1]], expect: 1 }, { args: [[-3, 7, 7]], expect: -3 },
    ]),
  code("code-longest-substring", ["T05", "T03"], "medium", "Longest Substring Without Repeating Characters", lc(3, "longest-substring-without-repeating-characters"), "Return the length of the longest substring with no repeated characters.",
    "length_of_longest_substring", "lengthOfLongestSubstring", "s", [
      { args: ["abcabcbb"], expect: 3 }, { args: ["bbbbb"], expect: 1 }, { args: ["pwwkew"], expect: 3 }, { args: [""], expect: 0 }, { args: ["abba"], expect: 2 }, { args: ["dvdf"], expect: 3 },
    ]),
  code("code-product-except-self", ["T06"], "medium", "Product of Array Except Self", lc(238, "product-of-array-except-self"), "Return an array where each element is the product of every other element. Don’t use division.",
    "product_except_self", "productExceptSelf", "nums", [
      { args: [[1, 2, 3, 4]], expect: [24, 12, 8, 6] }, { args: [[-1, 1, 0, -3, 3]], expect: [0, 0, 9, 0, 0] }, { args: [[2, 3]], expect: [3, 2] },
    ]),
  code("code-merge-intervals", ["T20", "T07"], "medium", "Merge Intervals", lc(56, "merge-intervals"), "Merge all overlapping intervals and return them sorted by start.",
    "merge", "merge", "intervals", [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expect: [[1, 6], [8, 10], [15, 18]] }, { args: [[[1, 4], [4, 5]]], expect: [[1, 5]] },
      { args: [[[1, 4], [0, 4]]], expect: [[0, 4]] }, { args: [[[1, 4], [2, 3]]], expect: [[1, 4]] },
    ]),
  code("code-num-islands", ["T23", "T22"], "medium", "Number of Islands", lc(200, "number-of-islands"), "grid is a list of rows of \"1\" (land) and \"0\" (water). Count the islands (land connected up, down, left or right).",
    "num_islands", "numIslands", "grid", [
      { args: [[["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]]], expect: 1 },
      { args: [[["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]]], expect: 3 },
      { args: [[["0"]]], expect: 0 }, { args: [[["1", "0", "1"]]], expect: 2 },
    ]),
  code("code-coin-change", ["T28"], "medium", "Coin Change", lc(322, "coin-change"), "Return the fewest coins needed to make amount, or -1 if it can’t be made. You have unlimited coins of each kind.",
    "coin_change", "coinChange", "coins, amount", [
      { args: [[1, 2, 5], 11], expect: 3 }, { args: [[2], 3], expect: -1 }, { args: [[1], 0], expect: 0 }, { args: [[2, 5, 10, 1], 27], expect: 4 }, { args: [[186, 419, 83, 408], 6249], expect: 20 },
    ]),
  code("code-house-robber", ["T27"], "medium", "House Robber", lc(198, "house-robber"), "Return the most money you can take without taking from two adjacent houses.",
    "rob", "rob", "nums", [
      { args: [[1, 2, 3, 1]], expect: 4 }, { args: [[2, 7, 9, 3, 1]], expect: 12 }, { args: [[2, 1, 1, 2]], expect: 4 }, { args: [[0]], expect: 0 },
    ]),
  code("code-daily-temperatures", ["T09"], "medium", "Daily Temperatures", lc(739, "daily-temperatures"), "For each day, return how many days until a warmer temperature, or 0.",
    "daily_temperatures", "dailyTemperatures", "temperatures", [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expect: [1, 1, 4, 2, 1, 1, 0, 0] }, { args: [[30, 40, 50, 60]], expect: [1, 1, 1, 0] }, { args: [[30, 60, 90]], expect: [1, 1, 0] },
    ]),
  code("code-search-rotated", ["T11"], "medium", "Search in Rotated Sorted Array", lc(33, "search-in-rotated-sorted-array"), "A sorted array of distinct numbers was rotated. Return the index of target, or -1, in O(log n).",
    "search_rotated", "searchRotated", "nums, target", [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expect: 4 }, { args: [[4, 5, 6, 7, 0, 1, 2], 3], expect: -1 }, { args: [[1], 0], expect: -1 }, { args: [[3, 1], 1], expect: 1 }, { args: [[5, 1, 3], 5], expect: 0 },
    ]),
  code("code-top-k-frequent", ["T19", "T03"], "medium", "Top K Frequent Elements", lc(347, "top-k-frequent-elements"), "Return the k most frequent numbers, in any order.",
    "top_k_frequent", "topKFrequent", "nums, k", [
      { args: [[1, 1, 1, 2, 2, 3], 2], expect: [1, 2] }, { args: [[1], 1], expect: [1] }, { args: [[4, 1, -1, 2, -1, 2, 3], 2], expect: [-1, 2] },
    ], "sorted"),
];

// ---------------------------------------------------------------- find the bug
const BUG: BugItem[] = [
  {
    id: "bug-binary-search", kind: "bug", topics: ["T11"], level: "easy", minutes: 4, title: "Binary search",
    fn: { python: "search", javascript: "search" },
    code: {
      python: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid
        else:
            hi = mid
    return lo if nums and nums[lo] == target else -1
`,
      javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return nums.length && nums[lo] === target ? lo : -1;
}
`,
    },
    bugLines: { python: [6], javascript: [6] },
    tests: [{ args: [[1, 3], 3], expect: 1 }, { args: [[-1, 0, 3, 5, 9, 12], 9], expect: 4 }, { args: [[-1, 0, 3, 5, 9, 12], 2], expect: -1 }, { args: [[5], 5], expect: 0 }],
    explanation: "lo = mid can stop making progress, so the loop never ends. It should be lo = mid + 1.",
  },
  {
    id: "bug-two-sum-sorted", kind: "bug", topics: ["T03", "T07"], level: "easy", minutes: 4, title: "Two Sum",
    fn: { python: "two_sum", javascript: "twoSum" },
    code: {
      python: `def two_sum(nums, target):
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
`,
      javascript: `function twoSum(nums, target) {
  nums = [...nums].sort((a, b) => a - b);
  let i = 0, j = nums.length - 1;
  while (i < j) {
    const s = nums[i] + nums[j];
    if (s === target) return [i, j];
    if (s < target) i++;
    else j--;
  }
  return [];
}
`,
    },
    bugLines: { python: [2, 7], javascript: [2, 6] },
    tests: [{ args: [[3, 2, 4], 6], expect: [1, 2] }, { args: [[2, 7, 11, 15], 9], expect: [0, 1] }, { args: [[3, 3], 6], expect: [0, 1] }, { args: [[5, 1, 3], 4], expect: [1, 2] }],
    compare: "sorted",
    explanation: "Sorting loses the original indices, so it returns positions in the sorted copy. Use a hash map of value to index.",
  },
  {
    id: "bug-reachable", kind: "bug", topics: ["T22"], level: "easy", minutes: 4, title: "Counting reachable nodes",
    fn: { python: "count_reachable", javascript: "countReachable" },
    code: {
      python: `def count_reachable(graph, start):
    count = 0
    def dfs(node):
        nonlocal count
        count += 1
        for nxt in graph[node]:
            dfs(nxt)
    dfs(start)
    return count
`,
      javascript: `function countReachable(graph, start) {
  let count = 0;
  function dfs(node) {
    count += 1;
    for (const nxt of graph[node]) {
      dfs(nxt);
    }
  }
  dfs(start);
  return count;
}
`,
    },
    bugLines: { python: [5, 6, 7], javascript: [4, 5, 6] },
    tests: [{ args: [[[1, 2], [2], [0]], 0], expect: 3 }, { args: [[[1], [0], []], 0], expect: 2 }, { args: [[[]], 0], expect: 1 }, { args: [[[1], [2], [3], [1]], 0], expect: 4 }],
    explanation: "There’s no visited set, so cycles recurse forever and shared nodes are counted twice. Skip nodes you’ve already seen before counting them.",
  },
  {
    id: "bug-longest-window", kind: "bug", topics: ["T05"], level: "medium", minutes: 4, title: "Longest substring without repeats",
    fn: { python: "longest", javascript: "longest" },
    code: {
      python: `def longest(s):
    seen = {}
    best = start = 0
    for i, ch in enumerate(s):
        if ch in seen:
            start = seen[ch] + 1
        seen[ch] = i
        best = max(best, i - start + 1)
    return best
`,
      javascript: `function longest(s) {
  const seen = new Map();
  let best = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (seen.has(ch)) {
      start = seen.get(ch) + 1;
    }
    seen.set(ch, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}
`,
    },
    bugLines: { python: [6], javascript: [7] },
    tests: [{ args: ["abba"], expect: 2 }, { args: ["abcabcbb"], expect: 3 }, { args: ["pwwkew"], expect: 3 }, { args: ["tmmzuxt"], expect: 5 }],
    explanation: "start can jump backwards to before the current window. It should be start = max(start, seen[ch] + 1).",
  },
  {
    id: "bug-prefix-sums", kind: "bug", topics: ["T06"], level: "easy", minutes: 4, title: "Range sums",
    fn: { python: "range_sums", javascript: "rangeSums" },
    code: {
      python: `def range_sums(nums, queries):
    # queries are inclusive [l, r] pairs
    prefix = [0] * len(nums)
    for i, x in enumerate(nums):
        prefix[i] = prefix[i - 1] + x
    return [prefix[r] - prefix[l] for l, r in queries]
`,
      javascript: `function rangeSums(nums, queries) {
  // queries are inclusive [l, r] pairs
  const prefix = new Array(nums.length).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i] = (i > 0 ? prefix[i - 1] : 0) + nums[i];
  }
  return queries.map(([l, r]) => prefix[r] - prefix[l]);
}
`,
    },
    bugLines: { python: [3, 6], javascript: [3, 7] },
    tests: [{ args: [[2, 4, 6, 8], [[1, 2], [0, 3]]], expect: [10, 20] }, { args: [[5], [[0, 0]]], expect: [5] }, { args: [[1, 2, 3], [[0, 0], [2, 2], [0, 2]]], expect: [1, 3, 6] }],
    explanation: "prefix[r] - prefix[l] drops nums[l]. Subtract the prefix just before l instead (0 when l is 0).",
  },
];

// ---------------------------------------------------------------- explain aloud
const EXPLAIN: ExplainItem[] = [
  { id: "ex-bfs-dfs", kind: "explain", topics: ["T22", "T17"], level: "medium", minutes: 3, title: "BFS or DFS",
    prompt: "When would you use BFS instead of DFS? Give an example.",
    rubric: ["BFS finds shortest paths in unweighted graphs and works level by level", "DFS suits exhaustive search, cycle detection and topological order", "Gives a concrete example of each"] },
  { id: "ex-hash-lookup", kind: "explain", topics: ["T01", "T03"], level: "easy", minutes: 3, title: "Hash map lookups",
    prompt: "Why is looking up a key in a hash map fast on average? When can it be slow?",
    rubric: ["The key is hashed straight to a bucket, so the average lookup is O(1)", "Collisions put several keys in one bucket", "Worst case O(n) when many keys collide"] },
  { id: "ex-dp-state", kind: "explain", topics: ["T27"], level: "medium", minutes: 3, title: "DP states",
    prompt: "Using Climbing Stairs, explain what a DP state is and how you find the recurrence.",
    rubric: ["State: the number of ways to reach step i", "Recurrence from the last move: ways(i−1) + ways(i−2)", "Base cases, and that only two values need keeping"] },
];

export const ITEMS: Item[] = [...APPROACH, ...MCQ, ...CODE, ...BUG, ...EXPLAIN];
export const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i])) as Record<string, Item>;

/** Items the student can answer without a human or AI grader. */
export const isAutoGraded = (i: Item) => i.kind !== "explain";
