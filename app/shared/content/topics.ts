// The 30-topic skill map from concierge/skill-map.md.

export type Tier = "core" | "common" | "advanced";

export interface Topic {
  id: string;
  name: string;
  tier: Tier;
  prereqs: string[];
}

export const TOPICS: Topic[] = [
  { id: "T01", name: "Complexity analysis", tier: "core", prereqs: [] },
  { id: "T02", name: "Arrays and strings", tier: "core", prereqs: [] },
  { id: "T03", name: "Hashing", tier: "core", prereqs: ["T02"] },
  { id: "T04", name: "Two pointers", tier: "core", prereqs: ["T02"] },
  { id: "T05", name: "Sliding window", tier: "core", prereqs: ["T03", "T04"] },
  { id: "T06", name: "Prefix sums", tier: "common", prereqs: ["T02"] },
  { id: "T07", name: "Sorting", tier: "core", prereqs: ["T02"] },
  { id: "T08", name: "Stack", tier: "core", prereqs: ["T02"] },
  { id: "T09", name: "Monotonic stack", tier: "common", prereqs: ["T08"] },
  { id: "T10", name: "Queue and deque", tier: "common", prereqs: ["T02"] },
  { id: "T11", name: "Binary search", tier: "core", prereqs: ["T02"] },
  { id: "T12", name: "Binary search on the answer", tier: "common", prereqs: ["T11"] },
  { id: "T13", name: "Linked lists", tier: "core", prereqs: ["T02"] },
  { id: "T14", name: "Recursion", tier: "core", prereqs: ["T01"] },
  { id: "T15", name: "Backtracking", tier: "common", prereqs: ["T14"] },
  { id: "T16", name: "Trees (DFS)", tier: "core", prereqs: ["T14"] },
  { id: "T17", name: "Trees (BFS)", tier: "core", prereqs: ["T10", "T16"] },
  { id: "T18", name: "Binary search trees", tier: "common", prereqs: ["T11", "T16"] },
  { id: "T19", name: "Heaps", tier: "core", prereqs: ["T07"] },
  { id: "T20", name: "Intervals", tier: "common", prereqs: ["T07"] },
  { id: "T21", name: "Greedy", tier: "common", prereqs: ["T07"] },
  { id: "T22", name: "Graphs", tier: "core", prereqs: ["T03", "T17"] },
  { id: "T23", name: "Grids", tier: "core", prereqs: ["T22"] },
  { id: "T24", name: "Topological sort", tier: "common", prereqs: ["T22"] },
  { id: "T25", name: "Union-find", tier: "advanced", prereqs: ["T22"] },
  { id: "T26", name: "Shortest paths", tier: "advanced", prereqs: ["T19", "T22"] },
  { id: "T27", name: "Dynamic programming (1-D)", tier: "core", prereqs: ["T14"] },
  { id: "T28", name: "Dynamic programming (2-D)", tier: "common", prereqs: ["T27"] },
  { id: "T29", name: "Tries", tier: "advanced", prereqs: ["T03", "T16"] },
  { id: "T30", name: "Bit manipulation", tier: "advanced", prereqs: ["T01"] },
];

export const TOPIC = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<string, Topic>;

// When two gaps tie, fix the one earlier in this list first.
export const ORDER = [
  "T01", "T02", "T03", "T04", "T05", "T11", "T08", "T13", "T16", "T14", "T07", "T19",
  "T22", "T23", "T17", "T27", "T20", "T06", "T09", "T12", "T18", "T21", "T24", "T15",
  "T28", "T10", "T29", "T30", "T25", "T26",
];

export type Destination = "oa" | "placement" | "interview";

export const DESTINATIONS: Record<Destination, { label: string; test: string; covers: string[]; readyRule: string }> = {
  oa: {
    label: "Internship online assessment",
    test: "2 problems, easy to medium · 60–90 minutes · auto-graded",
    covers: ["Arrays", "Hashing", "Two pointers", "Sliding window", "Trees", "Graphs", "DP"],
    readyRule: "All 16 core topics solid, every common topic at least shaky, and a timed 2-problem mock passed.",
  },
  placement: {
    label: "Campus placement coding round",
    test: "2–3 problems · 60–90 minutes · often with MCQs (aptitude and MCQs aren’t covered yet)",
    covers: ["Arrays", "Strings", "Hashing", "Sorting", "Trees", "Graphs", "DP"],
    readyRule: "All 16 core topics solid, every common topic at least shaky, and a timed mock passed.",
  },
  interview: {
    label: "New-grad interview loop",
    test: "2–4 live rounds of 45 minutes, talking through your solution",
    covers: ["Arrays", "Hashing", "Trees", "Graphs", "Heaps", "Intervals", "DP"],
    readyRule: "All 26 core and common topics solid, clear explanations, and a timed mock passed.",
  },
};

/** Status a topic must reach for this destination, or null if it never blocks "ready". */
export function requiredLevel(dest: Destination, tier: Tier): "solid" | "shaky" | null {
  if (tier === "advanced") return null;
  if (tier === "core") return "solid";
  return dest === "interview" ? "solid" : "shaky";
}
