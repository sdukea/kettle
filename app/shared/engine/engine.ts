// Pillow's decisions as plain functions: scoring, topic status, the skip list,
// gaps, the ready-by range, the 15-minute check path, and today's task.
// Rules follow concierge/rubric.md.

import { ITEM, ITEMS, type ApproachItem, type Item, type Language, type McqItem } from "../content/items";
import { ORDER, TOPIC, TOPICS, requiredLevel, type Destination } from "../content/topics";

// ------------------------------------------------------------------ types
export type Hours = "2-3" | "4-6" | "7-10" | "10+";
export type SessionKind = "fix" | "daily" | "weekly" | "mock";

export interface Profile { destination: Destination; testDate: string; hours: Hours; language: Language }

export interface Attempt { itemId: string; score: number | null; note: string; at: number; sessionId: number; sessionKind: SessionKind }

export interface SessionInfo { id: number; kind: SessionKind; at: number; topic?: string | null; practiceRef?: string | null; practiceDone?: string | null }

export type Response =
  | { kind: "code"; passed: number; total: number; seconds: number }
  | { kind: "approach"; structure: number; complexity: number; why?: string }
  | { kind: "mcq"; choice: number }
  | { kind: "bug"; line: number; passed: number; total: number; seconds: number }
  | { kind: "explain"; text: string };

export type Status = "solid" | "solid*" | "shaky" | "gap" | "unknown";

const DAY = 86_400_000;
export const SKIPPED = "Skipped the explanation";

// ------------------------------------------------------------------ scoring
/** Score 0–3 plus a one-line note for the evidence trail. null score = waiting for a human review. */
export function scoreResponse(item: Item, r: Response, language: Language): { score: number | null; note: string } {
  const t = `“${item.title}”`;
  if (item.kind === "code" && r.kind === "code") {
    const limit = item.minutes * 60;
    if (r.total > 0 && r.passed === r.total) {
      const mins = Math.max(1, Math.round(r.seconds / 60));
      if (r.seconds <= limit) return { score: 3, note: `Solved ${t} in ${mins} min` };
      if (r.seconds <= limit * 1.5) return { score: 2, note: `Solved ${t}, a little over time (${mins} min)` };
      return { score: 1, note: `Solved ${t}, but it took ${mins} min` };
    }
    if (r.passed * 2 >= r.total && r.passed > 0) return { score: 1, note: `Passed ${r.passed} of ${r.total} tests on ${t}` };
    return { score: 0, note: `Didn’t get ${t} working` };
  }
  if (item.kind === "approach" && r.kind === "approach") {
    const s = r.structure === 0, c = r.complexity === 0;
    if (s && c) return { score: 3, note: `Right approach and complexity for ${t}` };
    if (s) return { score: 1, note: `Right approach for ${t}, wrong complexity` };
    return { score: c ? 1 : 0, note: `Chose the wrong approach for ${t}` };
  }
  if (item.kind === "mcq" && r.kind === "mcq") {
    return r.choice === 0 ? { score: 3, note: "Got a complexity question right" } : { score: 0, note: "Missed a complexity question" };
  }
  if (item.kind === "bug" && r.kind === "bug") {
    const lineOk = item.bugLines[language].includes(r.line);
    const fixed = r.total > 0 && r.passed === r.total;
    if (fixed && lineOk) return { score: 3, note: `Found and fixed the bug in ${t}` };
    if (fixed) return { score: 2, note: `Fixed ${t}, but pointed at a different line` };
    if (lineOk) return { score: 1, note: `Found the bug in ${t}, but the fix failed tests` };
    return { score: 0, note: `Didn’t find the bug in ${t}` };
  }
  if (item.kind === "explain" && r.kind === "explain") {
    if (r.text.trim().length < 3) return { score: null, note: SKIPPED };
    return { score: null, note: `Explanation of “${item.title}” is waiting for review` };
  }
  throw new Error(`Response kind ${r.kind} doesn’t match item ${item.id}`);
}

// ------------------------------------------------------------------ topic status
export interface Evidence { itemId: string; score: number; note: string; at: number }
export interface TopicState { status: Status; evidence: Evidence[] }

export function topicStates(attempts: Attempt[]): Record<string, TopicState> {
  const ev: Record<string, Evidence[]> = Object.fromEntries(TOPICS.map((t) => [t.id, []]));
  for (const a of [...attempts].sort((x, y) => x.at - y.at)) {
    if (a.score === null) continue;
    const item = ITEM[a.itemId];
    if (!item) continue;
    for (const t of item.topics) ev[t]?.push({ itemId: a.itemId, score: a.score, note: a.note, at: a.at });
  }

  const out: Record<string, TopicState> = {};
  for (const t of TOPICS) {
    const e = ev[t.id];
    let status: Status = "unknown";
    if (e.length) {
      const latest = e[e.length - 1].score;
      const prev = e.length > 1 ? e[e.length - 2].score : null;
      const hasMedium = e.some((x) => x.score >= 2 && ITEM[x.itemId].level !== "easy");
      const easyPasses = e.filter((x) => x.score >= 2 && ITEM[x.itemId].level === "easy").length;
      if (latest <= 1) status = "gap";
      else if (prev !== null && prev <= 1) status = "shaky";
      else status = hasMedium || easyPasses >= 2 ? "solid" : "shaky";
    }
    out[t.id] = { status, evidence: e };
  }

  // Implied credit: being solid on a topic implies its prerequisites, as long as the
  // direct evidence on them is unchecked or only thin (passes, never a fail).
  // So a correct answer can't move a topic backwards.
  const noFails = (id: string) => out[id].evidence.every((x) => x.score >= 2);
  const visit = (id: string) => {
    for (const p of TOPIC[id].prereqs) {
      const st = out[p].status;
      if (st === "unknown" || (st === "shaky" && noFails(p))) { out[p].status = "solid*"; visit(p); }
    }
  };
  for (const t of TOPICS) if (out[t.id].status === "solid") visit(t.id);
  return out;
}

export const isSolid = (s: Status) => s === "solid" || s === "solid*";

function satisfies(s: Status, need: "solid" | "shaky") {
  return need === "solid" ? isSolid(s) : s !== "gap" && s !== "unknown";
}

// ------------------------------------------------------------------ the result
export interface ReadyBy { from: string; to: string; sessions: number; perWeek: number; verdict: "ready" | "on-track" | "tight" | "at-risk" }
export interface Position {
  states: Record<string, TopicState>;
  skip: string[];
  skipPct: number;
  gaps: { topic: string; evidence: string }[];
  unknownCore: string[];
  requirementsMet: boolean;
  /** Share of the destination's requirements met, including the mock, 0–100. */
  progress: number;
  readyBy: ReadyBy;
}

const HOURS_MID: Record<Hours, number> = { "2-3": 2.5, "4-6": 5, "7-10": 8.5, "10+": 12 };

function rank(id: string) {
  const tier = TOPIC[id].tier;
  return (tier === "core" ? 0 : tier === "common" ? 100 : 200) + ORDER.indexOf(id);
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function position(profile: Profile, attempts: Attempt[], sessions: SessionInfo[], now: number, mockPassed: boolean): Position {
  const states = topicStates(attempts);
  const graded = TOPICS.filter((t) => t.tier !== "advanced");
  const skip = graded.filter((t) => isSolid(states[t.id].status)).map((t) => t.id);
  const skipPct = Math.round((skip.length / graded.length) * 20) * 5;

  // A gap is workable unless one of its prerequisites is itself a known gap.
  const prereqsReady = (id: string) => TOPIC[id].prereqs.every((p) => states[p].status !== "gap");
  let gapIds = TOPICS.filter((t) => states[t.id].status === "gap" && t.tier !== "advanced").map((t) => t.id).sort((a, b) => rank(a) - rank(b));
  const workable = gapIds.filter(prereqsReady);
  gapIds = [...workable, ...gapIds.filter((g) => !workable.includes(g))];
  if (gapIds.length < 2) {
    gapIds.push(...TOPICS.filter((t) => states[t.id].status === "shaky" && t.tier !== "advanced").map((t) => t.id).sort((a, b) => rank(a) - rank(b)));
  }
  // Name at most three gaps, and don't let one wrong answer fill two slots.
  const gaps: { topic: string; evidence: string }[] = [];
  const usedEvidence = new Set<string>();
  for (const topic of gapIds) {
    if (gaps.length === 3) break;
    const e = states[topic].evidence;
    const low = [...e].reverse().find((x) => x.score <= 1) ?? e[e.length - 1];
    const key = low ? `${low.itemId}@${low.at}` : topic;
    if (usedEvidence.has(key)) continue;
    usedEvidence.add(key);
    gaps.push({ topic, evidence: low ? low.note : "" });
  }
  const unknownCore = TOPICS.filter((t) => t.tier === "core" && states[t.id].status === "unknown").map((t) => t.id).sort((a, b) => rank(a) - rank(b));

  // Ready-by: sessions still needed ÷ sessions per week.
  let sessionsNeeded = 0;
  let requirementsMet = true;
  for (const t of TOPICS) {
    const need = requiredLevel(profile.destination, t.tier);
    if (!need) continue;
    const s = states[t.id].status;
    if (satisfies(s, need)) continue;
    requirementsMet = false;
    if (s === "unknown") sessionsNeeded += 1;
    else if (s === "gap") sessionsNeeded += need === "solid" ? 3 : 2;
    else sessionsNeeded += 1.5; // shaky, needs solid
  }
  if (!mockPassed) sessionsNeeded += 2;

  const planned = (HOURS_MID[profile.hours] * 60) / 25;
  const firstFix = sessions.filter((s) => s.kind === "fix").map((s) => s.at).sort((a, b) => a - b)[0];
  let perWeek = planned;
  if (firstFix !== undefined && now - firstFix >= 7 * DAY) {
    const done = sessions.filter((s) => s.kind === "daily" && s.at >= now - 7 * DAY && s.practiceDone && s.practiceDone !== "no").length;
    perWeek = done > 0 ? done : planned * 0.5;
  }
  const weeks = sessionsNeeded / perWeek;
  const from = now + weeks * 0.8 * 7 * DAY;
  const to = now + weeks * 1.3 * 7 * DAY;
  const test = Date.parse(profile.testDate + "T23:59:59Z");
  const verdict: ReadyBy["verdict"] = sessionsNeeded === 0 ? "ready" : to <= test ? "on-track" : from <= test ? "tight" : "at-risk";

  const required = TOPICS.filter((t) => requiredLevel(profile.destination, t.tier));
  const met = required.filter((t) => satisfies(states[t.id].status, requiredLevel(profile.destination, t.tier)!)).length;
  const progress = Math.round(((met + (mockPassed ? 1 : 0)) / (required.length + 1)) * 100);

  return {
    states, skip, skipPct, gaps, unknownCore, requirementsMet, progress,
    readyBy: { from: iso(from), to: iso(to), sessions: Math.ceil(sessionsNeeded), perWeek: Math.round(perWeek * 10) / 10, verdict },
  };
}

// ------------------------------------------------------------------ the 15-minute check
/** The adaptive path for the first check. Returns the next item id, or null when finished. */
export function nextFixItem(done: { itemId: string; score: number | null }[]): string | null {
  const s = (i: number) => done[i]?.score ?? 0;
  const path = [
    () => "code-two-sum",
    () => (s(0) >= 2 ? "ap-longest-substring" : "ap-contains-duplicate"),
    () => (s(1) >= 2 ? "bug-longest-window" : "bug-two-sum-sorted"),
    () => "ap-level-order",
    () => "ap-islands",
    () => "ap-house-robber",
    () => (s(0) >= 2 ? "ap-search-rotated" : "cx-nested"),
    () => "ex-bfs-dfs",
  ];
  return done.length < path.length ? path[done.length]() : null;
}
export const FIX_LENGTH = 8;

// ------------------------------------------------------------------ today's task
export type Practice = { type: "code"; itemId: string } | { type: "leetcode"; num: number; slug: string; title: string };
export type Next =
  | { kind: "fix" }
  | { kind: "weekly"; itemIds: string[] }
  | { kind: "check"; topic: string; itemId: string; why: string }
  | { kind: "practice"; topic: string; practice: Practice; checkItemId: string; why: string }
  | { kind: "mock"; itemIds: string[] }
  | { kind: "ready" };

const quickChecks = (topic: string) =>
  ITEMS.filter((i): i is ApproachItem | McqItem => (i.kind === "approach" || i.kind === "mcq") && i.topics.includes(topic))
    .sort((a, b) => Number(b.topics[0] === topic) - Number(a.topics[0] === topic));

/** A quick check on this topic: unseen first, otherwise the one seen longest ago. */
export function pickCheck(topic: string, attempts: Attempt[], exclude: Set<string> = new Set()): string {
  const lastSeen = new Map<string, number>();
  for (const a of attempts) lastSeen.set(a.itemId, Math.max(lastSeen.get(a.itemId) ?? 0, a.at));
  const pool = quickChecks(topic).filter((i) => !exclude.has(i.id));
  const unseen = pool.find((i) => !lastSeen.has(i.id));
  if (unseen) return unseen.id;
  return [...pool].sort((a, b) => (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0))[0]?.id ?? quickChecks(topic)[0].id;
}

function pickPractice(topic: string, attempts: Attempt[], sessions: SessionInfo[], minutes: number): Practice {
  const tried = new Set(attempts.map((a) => a.itemId));
  const practised = new Set(sessions.map((s) => s.practiceRef).filter(Boolean));
  if (minutes >= 25) {
    const code = ITEMS.find((i) => i.kind === "code" && i.topics.includes(topic) && !tried.has(i.id) && !practised.has(`code:${i.id}`));
    if (code) return { type: "code", itemId: code.id };
  }
  const problems = quickChecks(topic).filter((i): i is ApproachItem => i.kind === "approach" && !!i.lc);
  const fresh = problems.find((p) => !practised.has(`lc:${p.lc!.num}`) && !tried.has(p.id)) ?? problems.find((p) => !practised.has(`lc:${p.lc!.num}`)) ?? problems[0];
  return { type: "leetcode", num: fresh.lc!.num, slug: fresh.lc!.slug, title: fresh.title };
}

export interface NextContext {
  profile: Profile;
  attempts: Attempt[];
  sessions: SessionInfo[];
  minutes: number;
  now: number;
  mockPassed: boolean;
}

export function chooseNext(ctx: NextContext): Next {
  const { profile, attempts, sessions, minutes, now } = ctx;
  const fixes = sessions.filter((s) => s.kind === "fix");
  if (!fixes.length) return { kind: "fix" };

  const lastCheckIn = Math.max(...sessions.filter((s) => s.kind === "fix" || s.kind === "weekly").map((s) => s.at));
  if (now - lastCheckIn >= 7 * DAY) return { kind: "weekly", itemIds: weeklyItems(ctx) };

  const states = topicStates(attempts);
  const candidates = TOPICS.filter((t) => {
    const need = requiredLevel(profile.destination, t.tier);
    return need && !satisfies(states[t.id].status, need);
  }).map((t) => t.id);

  if (!candidates.length) {
    if (!ctx.mockPassed) return { kind: "mock", itemIds: mockItems(attempts) };
    return { kind: "ready" };
  }

  // Work on known gaps first (the ones the result screen named), as long as no prerequisite
  // is itself a known gap. Unchecked topics get a quick check once no gap is workable,
  // and in the weekly check-in.
  const byRank = (a: string, b: string) => rank(a) - rank(b);
  const known = candidates.filter((id) => states[id].status !== "unknown");
  const workable = known.filter((id) => TOPIC[id].prereqs.every((p) => states[p].status !== "gap")).sort(byRank);
  const unknown = candidates.filter((id) => states[id].status === "unknown").sort(byRank);
  const tierWord = (id: string) => (TOPIC[id].tier === "core" ? "it’s in most coding tests" : "it comes up often");

  const topic = workable[0] ?? known.sort(byRank)[0];
  if (!topic) {
    const u = unknown[0];
    return { kind: "check", topic: u, itemId: pickCheck(u, attempts), why: `We haven’t checked ${TOPIC[u].name.toLowerCase()} yet, and ${tierWord(u)}.` };
  }
  const why = states[topic].status === "gap" ? `It’s your top gap, and ${tierWord(topic)}.` : `It’s close. One more good result makes it solid.`;
  if (minutes < 25) return { kind: "check", topic, itemId: pickCheck(topic, attempts), why };
  const practice = pickPractice(topic, attempts, sessions, minutes);
  const exclude = new Set<string>(practice.type === "leetcode" ? quickChecks(topic).filter((i) => i.kind === "approach" && i.lc?.num === practice.num).map((i) => i.id) : []);
  return { kind: "practice", topic, practice, checkItemId: pickCheck(topic, attempts, exclude), why };
}

/** Weekly check-in: two topics worked on since the last check-in, plus one not yet checked. */
export function weeklyItems(ctx: Pick<NextContext, "profile" | "attempts" | "sessions">): string[] {
  const { profile, attempts, sessions } = ctx;
  const states = topicStates(attempts);
  const lastCheckIn = Math.max(...sessions.filter((s) => s.kind === "fix" || s.kind === "weekly").map((s) => s.at), 0);
  const worked = [...new Set(sessions.filter((s) => s.kind === "daily" && s.at >= lastCheckIn && s.topic).map((s) => s.topic as string))];
  const needs = (id: string) => {
    const need = requiredLevel(profile.destination, TOPIC[id].tier);
    return !!need && !satisfies(states[id].status, need);
  };
  const topics: string[] = worked.filter((t) => states[t].status !== "solid").slice(0, 2);
  const unknown = TOPICS.filter((t) => t.tier === "core" && states[t.id].status === "unknown").map((t) => t.id).sort((a, b) => rank(a) - rank(b));
  for (const t of unknown) if (topics.length < 3 && !topics.includes(t)) { topics.push(t); break; }
  const rest = TOPICS.map((t) => t.id).filter((id) => needs(id) && !topics.includes(id)).sort((a, b) => rank(a) - rank(b));
  while (topics.length < 3 && rest.length) topics.push(rest.shift()!);
  const used = new Set<string>();
  return topics.map((t) => {
    const id = pickCheck(t, attempts, used);
    used.add(id);
    return id;
  });
}

/** Two medium code problems not tried before, for the timed mock. */
export function mockItems(attempts: Attempt[]): string[] {
  const tried = new Set(attempts.map((a) => a.itemId));
  const medium = ITEMS.filter((i) => i.kind === "code" && i.level === "medium");
  const fresh = medium.filter((i) => !tried.has(i.id));
  return [...fresh, ...medium.filter((i) => tried.has(i.id))].slice(0, 2).map((i) => i.id);
}

/** A mock is passed when both of its problems scored 2 or more. */
export function mockPassed(attempts: Attempt[]): boolean {
  const bySession = new Map<number, Attempt[]>();
  for (const a of attempts.filter((a) => a.sessionKind === "mock")) bySession.set(a.sessionId, [...(bySession.get(a.sessionId) ?? []), a]);
  return [...bySession.values()].some((as) => as.length >= 2 && as.every((a) => (a.score ?? 0) >= 2));
}
