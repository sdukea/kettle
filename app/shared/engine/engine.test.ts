import { describe, expect, it } from "vitest";
import { ITEM } from "../content/items";
import {
  chooseNext, mockPassed, nextFixItem, position, scoreResponse, topicStates, weeklyItems,
  type Attempt, type Profile, type SessionInfo,
} from "./engine";

const DAY = 86_400_000;
const NOW = Date.parse("2026-10-10T12:00:00Z");
const profile: Profile = { destination: "oa", testDate: "2026-12-01", hours: "4-6", language: "python" };

let t = NOW - 10_000;
const at = (itemId: string, score: number | null, sessionKind: Attempt["sessionKind"] = "fix", sessionId = 1): Attempt =>
  ({ itemId, score, note: `note ${itemId}`, at: t++, sessionId, sessionKind });
const fix: SessionInfo = { id: 1, kind: "fix", at: NOW - 1000 };

describe("scoring", () => {
  it("code: in time is 3, slow is 2 then 1, partial is 1, nothing is 0", () => {
    const two = ITEM["code-two-sum"];
    expect(scoreResponse(two, { kind: "code", passed: 5, total: 5, seconds: 200 }, "python").score).toBe(3);
    expect(scoreResponse(two, { kind: "code", passed: 5, total: 5, seconds: 600 }, "python").score).toBe(2);
    expect(scoreResponse(two, { kind: "code", passed: 5, total: 5, seconds: 2000 }, "python").score).toBe(1);
    expect(scoreResponse(two, { kind: "code", passed: 3, total: 5, seconds: 100 }, "python").score).toBe(1);
    expect(scoreResponse(two, { kind: "code", passed: 1, total: 5, seconds: 100 }, "python").score).toBe(0);
  });
  it("approach: both right is 3, one right is 1, none is 0 (so guessing rarely scores well)", () => {
    const a = ITEM["ap-longest-substring"];
    expect(scoreResponse(a, { kind: "approach", structure: 0, complexity: 0 }, "python").score).toBe(3);
    expect(scoreResponse(a, { kind: "approach", structure: 0, complexity: 2 }, "python").score).toBe(1);
    expect(scoreResponse(a, { kind: "approach", structure: 1, complexity: 1 }, "python").score).toBe(0);
  });
  it("bug: line and fix, fix only, line only, neither", () => {
    const b = ITEM["bug-longest-window"];
    expect(scoreResponse(b, { kind: "bug", line: 6, passed: 4, total: 4, seconds: 60 }, "python").score).toBe(3);
    expect(scoreResponse(b, { kind: "bug", line: 2, passed: 4, total: 4, seconds: 60 }, "python").score).toBe(2);
    expect(scoreResponse(b, { kind: "bug", line: 7, passed: 1, total: 4, seconds: 60 }, "javascript").score).toBe(1);
    expect(scoreResponse(b, { kind: "bug", line: 1, passed: 0, total: 4, seconds: 60 }, "python").score).toBe(0);
  });
  it("explanations wait for review", () => {
    expect(scoreResponse(ITEM["ex-bfs-dfs"], { kind: "explain", text: "BFS is level by level" }, "python").score).toBeNull();
  });
});

describe("topic status", () => {
  it("a passed medium check makes a topic solid and credits its prerequisites", () => {
    const s = topicStates([at("ap-longest-substring", 3)]);
    expect(s.T05.status).toBe("solid");
    expect(s.T03.status).toBe("solid"); // the item is tagged with hashing too
    expect(s.T04.status).toBe("solid*");
    expect(s.T02.status).toBe("solid*");
    expect(s.T27.status).toBe("unknown");
  });
  it("one easy pass is shaky, two make it solid", () => {
    expect(topicStates([at("ap-contains-duplicate", 3)]).T03.status).toBe("shaky");
    expect(topicStates([at("ap-contains-duplicate", 3), at("ap-valid-anagram", 3)]).T03.status).toBe("solid");
  });
  it("latest low score is a gap; a pass right after a fail is only shaky", () => {
    expect(topicStates([at("ap-house-robber", 3), at("ap-decode-ways", 0)]).T27.status).toBe("gap");
    expect(topicStates([at("ap-house-robber", 0), at("ap-decode-ways", 3)]).T27.status).toBe("shaky");
  });
  it("a correct easy answer never downgrades a topic that was solid by implication", () => {
    const s = topicStates([at("ap-longest-substring", 3), at("code-max-profit", 3)]);
    expect(s.T02.status).toBe("solid*"); // one easy pass alone is thin, but nothing contradicts the implied credit
  });
  it("implied credit never overrides a direct gap", () => {
    const s = topicStates([at("ap-contains-duplicate", 0), at("ap-longest-substring", 3)]);
    expect(s.T04.status).toBe("solid*");
    expect(s.T03.status).toBe("shaky"); // fail then pass on hashing
  });
  it("explanations waiting for review don't count", () => {
    expect(topicStates([at("ex-bfs-dfs", null)]).T22.status).toBe("unknown");
  });
});

describe("the 15-minute check path", () => {
  it("adapts after the first answers and ends after 8 checks", () => {
    expect(nextFixItem([])).toBe("code-two-sum");
    expect(nextFixItem([{ itemId: "code-two-sum", score: 3 }])).toBe("ap-longest-substring");
    expect(nextFixItem([{ itemId: "code-two-sum", score: 0 }])).toBe("ap-contains-duplicate");
    const strong = [{ itemId: "x", score: 3 }, { itemId: "y", score: 3 }];
    expect(nextFixItem(strong)).toBe("bug-longest-window");
    expect(nextFixItem(Array.from({ length: 8 }, () => ({ itemId: "x", score: 3 })))).toBeNull();
    const ids = new Set<string>();
    const done: { itemId: string; score: number }[] = [];
    for (let id = nextFixItem(done); id; id = nextFixItem(done)) { expect(ITEM[id]).toBeTruthy(); ids.add(id); done.push({ itemId: id, score: 3 }); }
    expect(done).toHaveLength(8);
  });
});

describe("the result", () => {
  const strongFix = [
    at("code-two-sum", 3), at("ap-longest-substring", 3), at("bug-longest-window", 1), at("ap-level-order", 3),
    at("ap-islands", 0), at("ap-house-robber", 3), at("ap-search-rotated", 3), at("ex-bfs-dfs", null),
  ];
  it("lists skips, at most 3 gaps with evidence, and unchecked core topics", () => {
    const p = position(profile, strongFix, [fix], NOW, false);
    expect(p.skip).toContain("T03");
    expect(p.skip).toContain("T17");
    expect(p.skipPct % 5).toBe(0);
    expect(p.gaps.length).toBeGreaterThan(0);
    expect(p.gaps.length).toBeLessThanOrEqual(3);
    expect(p.gaps.map((g) => g.topic)).toContain("T05");
    expect(p.gaps.find((g) => g.topic === "T05")?.evidence).toMatch(/bug/);
    expect(p.unknownCore).toContain("T08");
    expect(p.requirementsMet).toBe(false);
  });
  it("one wrong answer never fills two gap slots, and unchecked prerequisites don't push a gap down", () => {
    const p = position(profile, strongFix, [fix], NOW, false);
    const names = p.gaps.map((g) => g.topic);
    expect(names.filter((t) => t === "T22" || t === "T23")).toHaveLength(1); // both came from the islands answer
    expect(names[0]).toBe("T05"); // core, early in the order, and two pointers being unchecked doesn't block it
  });
  it("ready-by is a range in the future and the verdict compares it with the test date", () => {
    const p = position(profile, strongFix, [fix], NOW, false);
    expect(p.readyBy.from <= p.readyBy.to).toBe(true);
    expect(p.readyBy.from > "2026-10-10").toBe(true);
    const tight = position({ ...profile, testDate: "2026-10-12" }, strongFix, [fix], NOW, false);
    expect(["tight", "at-risk"]).toContain(tight.readyBy.verdict);
  });
  it("more hours a week means an earlier date", () => {
    const slow = position({ ...profile, hours: "2-3" }, strongFix, [fix], NOW, false);
    const fast = position({ ...profile, hours: "10+" }, strongFix, [fix], NOW, false);
    expect(fast.readyBy.to < slow.readyBy.to).toBe(true);
  });
});

describe("today's task", () => {
  const base = { profile, sessions: [fix], now: NOW, mockPassed: false };
  it("checks an unchecked topic once no gap is left to work on", () => {
    const n = chooseNext({ ...base, attempts: [at("ap-contains-duplicate", 3), at("ap-valid-anagram", 3)], minutes: 25 });
    expect(n.kind).toBe("check");
    if (n.kind === "check") expect(n.topic).toBe("T01");
  });
  it("asks for the 15-minute check first", () => {
    expect(chooseNext({ ...base, sessions: [], attempts: [], minutes: 25 }).kind).toBe("fix");
  });
  it("practises the top gap with 25 minutes, and only checks with 10", () => {
    const attempts = [at("ap-contains-duplicate", 0)];
    const n = chooseNext({ ...base, attempts, minutes: 25 });
    expect(n.kind).toBe("practice");
    if (n.kind === "practice") {
      expect(n.topic).toBe("T03"); // the named gap, not an unchecked topic
    }
    expect(chooseNext({ ...base, attempts, minutes: 10 }).kind).toBe("check");
  });
  it("prefers an in-app problem with tests when one exists for the topic", () => {
    const attempts = [at("ap-move-zeroes", 3), at("ap-plus-one", 3), at("ap-contains-duplicate", 0)];
    const n = chooseNext({ ...base, attempts, minutes: 25 });
    expect(n.kind).toBe("practice");
    if (n.kind === "practice") {
      expect(n.topic).toBe("T03");
      expect(n.practice).toEqual({ type: "code", itemId: "code-two-sum" });
      expect(ITEM[n.checkItemId].topics).toContain("T03");
    }
  });
  it("runs the weekly check-in after 7 days", () => {
    const n = chooseNext({ ...base, sessions: [{ ...fix, at: NOW - 8 * DAY }], attempts: [at("ap-contains-duplicate", 0)], minutes: 25 });
    expect(n.kind).toBe("weekly");
    if (n.kind === "weekly") expect(n.itemIds).toHaveLength(3);
  });
  it("weekly items are distinct", () => {
    const ids = weeklyItems({ profile, attempts: [at("ap-contains-duplicate", 0)], sessions: [fix] });
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("asks for a mock once every requirement is met, then says ready", () => {
    // Pass every quick check for every topic.
    const all = Object.values(ITEM).filter((i) => i.kind === "approach" || i.kind === "mcq").map((i) => at(i.id, 3));
    const n = chooseNext({ ...base, attempts: all, minutes: 25 });
    expect(n.kind).toBe("mock");
    const mock = [at("code-coin-change", 3, "mock", 9), at("code-merge-intervals", 2, "mock", 9)];
    expect(mockPassed(mock)).toBe(true);
    expect(chooseNext({ ...base, attempts: [...all, ...mock], minutes: 25, mockPassed: true }).kind).toBe("ready");
    expect(mockPassed([at("code-coin-change", 3, "mock", 9), at("code-merge-intervals", 1, "mock", 9)])).toBe(false);
  });
});
