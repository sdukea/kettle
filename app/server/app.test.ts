import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { openDb } from "./db";
import { ITEM } from "../shared/content/items";

const DAY = 86_400_000;

function setup() {
  let clock = Date.parse("2026-10-10T09:00:00Z");
  const app = createApp({ db: openDb(":memory:"), adminPassword: "secret", now: () => clock });
  const jar: Record<string, string> = {};
  const call = async (method: string, path: string, body?: unknown) => {
    const res = await app.request(path, {
      method,
      headers: { "content-type": "application/json", cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ") },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(";");
      const [k, v] = kv.split("=");
      jar[k] = v;
    }
    const text = await res.text();
    let data: any = text;
    try { data = JSON.parse(text); } catch { /* csv */ }
    return { status: res.status, data };
  };
  return { call, tick: (ms: number) => { clock += ms; } };
}

/** Answer like a strong student: right approach, solved code, found bugs. */
function goodAnswer(item: any) {
  switch (item.kind) {
    case "code": return { kind: "code", passed: item.tests.length, total: item.tests.length };
    case "approach": return { kind: "approach", structure: 0, complexity: 0 };
    case "mcq": return { kind: "mcq", choice: 0 };
    case "bug": return { kind: "bug", line: ITEM[item.id].kind === "bug" ? (ITEM[item.id] as any).bugLines.python[0] : 1, passed: item.tests.length, total: item.tests.length };
    case "explain": return { kind: "explain", text: "BFS goes level by level, so it finds shortest paths." };
  }
}

describe("the whole flow", () => {
  it("signs up, sets a goal, takes the check, gets a result, does a daily task", async () => {
    const { call, tick } = setup();
    expect((await call("GET", "/api/me")).data.stage).toBe("welcome");
    expect((await call("POST", "/api/signup", { name: "Ananya", email: "a@x.in", whatsapp: "+91 90000 00000" })).status).toBe(400);
    expect((await call("POST", "/api/signup", { name: "Ananya", email: "a@x.in", whatsapp: "+91 90000 00000", consent: true })).status).toBe(200);
    expect((await call("GET", "/api/me")).data.stage).toBe("goal");

    expect((await call("POST", "/api/goal", { destination: "oa", testDate: "2026-12-01", hours: "4-6", language: "python" })).status).toBe(200);
    expect((await call("GET", "/api/me")).data.stage).toBe("finish-line");
    await call("POST", "/api/finish-line");
    expect((await call("GET", "/api/me")).data.stage).toBe("check");

    // The 15-minute check: 8 adaptive items, answers never leak to the browser.
    let s = (await call("POST", "/api/sessions", { kind: "fix" })).data;
    expect(s.total).toBe(8);
    const seen: string[] = [];
    let firstScore: number | null = null;
    while (s.item) {
      if (s.item.kind === "approach") expect(JSON.stringify(s.item)).not.toContain('"answer"');
      seen.push(s.item.id);
      const r = await call("POST", `/api/sessions/${s.sessionId}/answer`, { itemId: s.item.id, confidence: 4, response: goodAnswer(s.item), seconds: 60 });
      expect(r.status).toBe(200);
      if (firstScore === null) firstScore = r.data.score;
      tick(60_000);
      if (r.data.done) break;
      s = r.data.next;
    }
    expect(seen).toHaveLength(8);
    expect(firstScore).toBe(3); // solved in a minute, with time sent beside the answer like the browser does
    expect(seen[1]).toBe("ap-longest-substring"); // adapted to a strong start

    const me = (await call("GET", "/api/me")).data;
    expect(me.stage).toBe("active");
    expect(me.position.skipPct).toBeGreaterThanOrEqual(40);
    expect(me.position.pendingReviews).toBe(1);
    expect(me.access.allowed).toBe(true);

    // A daily task with 25 minutes.
    const next = (await call("GET", "/api/next?minutes=25")).data;
    expect(["practice", "check"]).toContain(next.kind);
    const d = (await call("POST", "/api/sessions", { kind: "daily", minutes: 25 })).data;
    expect(d.item).toBeTruthy();
    let item = d.item, sid = d.sessionId;
    while (item) {
      const r = await call("POST", `/api/sessions/${sid}/answer`, { itemId: item.id, confidence: 3, response: goodAnswer(item), seconds: 100 });
      item = r.data.next?.item ?? null;
    }
    expect((await call("POST", `/api/sessions/${sid}/practice`, { done: "yes" })).status).toBe(200);
    expect((await call("POST", "/api/next-session", { at: "2026-10-11T14:30:00Z" })).status).toBe(200);

    // After the free days, daily tasks need a season.
    tick(4 * DAY);
    expect((await call("POST", "/api/sessions", { kind: "daily", minutes: 25 })).status).toBe(402);
    await call("POST", "/api/pay/claim");
    expect((await call("POST", "/api/sessions", { kind: "daily", minutes: 25 })).status).toBe(200);

    // A week after the check, the weekly check-in comes up.
    tick(4 * DAY);
    expect((await call("GET", "/api/next?minutes=25")).data.kind).toBe("weekly");
    const w = (await call("POST", "/api/sessions", { kind: "weekly" })).data;
    expect(w.total).toBe(3);
  });

  it("rejects an answer for the wrong question", async () => {
    const { call } = setup();
    await call("POST", "/api/signup", { name: "B", email: "b@x.in", whatsapp: "1", consent: true });
    await call("POST", "/api/goal", { destination: "oa", testDate: "2026-12-01", hours: "4-6", language: "javascript" });
    const s = (await call("POST", "/api/sessions", { kind: "fix" })).data;
    expect(s.item.starter).toContain("function twoSum");
    const r = await call("POST", `/api/sessions/${s.sessionId}/answer`, { itemId: "ap-islands", response: { kind: "approach", structure: 0, complexity: 0 } });
    expect(r.status).toBe(409);
  });

  it("admin: login, funnel, review an explanation, confirm payment, export", async () => {
    const { call } = setup();
    await call("POST", "/api/signup", { name: "C", email: "c@x.in", whatsapp: "1", consent: true });
    await call("POST", "/api/goal", { destination: "interview", testDate: "2026-12-01", hours: "7-10", language: "python" });
    let s = (await call("POST", "/api/sessions", { kind: "fix" })).data;
    while (s?.item) {
      const r = await call("POST", `/api/sessions/${s.sessionId}/answer`, { itemId: s.item.id, response: goodAnswer(s.item), seconds: 30 });
      s = r.data.next;
    }
    expect((await call("GET", "/api/admin/overview")).status).toBe(401);
    expect((await call("POST", "/api/admin/login", { password: "nope" })).status).toBe(401);
    expect((await call("POST", "/api/admin/login", { password: "secret" })).status).toBe(200);
    const o = (await call("GET", "/api/admin/overview")).data;
    expect(o.funnel.finishedFix).toBe(1);
    expect(o.killCriteria[0].pass).toBe(true);
    expect(o.reviews).toHaveLength(1);
    expect((await call("POST", "/api/admin/review", { attemptId: o.reviews[0].id, score: 3 })).status).toBe(200);
    expect((await call("POST", "/api/admin/paid", { studentId: o.students[0].id, paid: "confirmed" })).status).toBe(200);
    const o2 = (await call("GET", "/api/admin/overview")).data;
    expect(o2.reviews).toHaveLength(0);
    expect(o2.funnel.paidConfirmed).toBe(1);
    const csv = (await call("GET", "/api/admin/export.csv")).data as string;
    expect(csv.split("\n")).toHaveLength(9);
  });
});
