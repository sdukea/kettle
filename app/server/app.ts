import { Hono, type Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { ITEM, type Item, type Language } from "../shared/content/items";
import { DESTINATIONS, TOPIC, TOPICS, type Destination } from "../shared/content/topics";
import {
  FIX_LENGTH, SKIPPED, chooseNext, mockItems, mockPassed, nextFixItem, position, scoreResponse, topicStates, weeklyItems,
  type Hours, type Profile, type Response, type SessionKind,
} from "../shared/engine/engine";
import { history, type AttemptRow, type Db, type SessionRow, type StudentRow } from "./db";

export interface Config {
  db: Db;
  adminPassword?: string;
  upiId?: string;
  price?: number;
  trialDays?: number;
  secureCookies?: boolean;
  now?: () => number;
}

const DAY = 86_400_000;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const HOURS: Hours[] = ["2-3", "4-6", "7-10", "10+"];
const DESTS = Object.keys(DESTINATIONS) as Destination[];

/** Stable shuffle so options don't always appear with the right answer first. */
function shuffle<T>(xs: T[], seed: string): { i: number; text: T }[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = xs.map((text, i) => ({ i, text }));
  for (let k = out.length - 1; k > 0; k--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (k + 1);
    [out[k], out[j]] = [out[j], out[k]];
  }
  return out;
}

/** What the browser is allowed to see of an item: never the answers to choice questions. */
export function publicItem(item: Item, lang: Language) {
  const base = { id: item.id, kind: item.kind, title: item.title, level: item.level, minutes: item.minutes, topics: item.topics.map((t) => TOPIC[t].name), lc: item.lc };
  switch (item.kind) {
    case "code":
      return { ...base, prompt: item.prompt, fn: item.fn[lang], starter: item.starter[lang], tests: item.tests, compare: item.compare ?? "exact" };
    case "approach":
      return { ...base, prompt: item.prompt, structures: shuffle(item.structures, item.id + "s"), complexities: shuffle(item.complexities, item.id + "c") };
    case "mcq":
      return { ...base, prompt: item.prompt, code: item.code, options: shuffle(item.options, item.id) };
    case "bug":
      return { ...base, fn: item.fn[lang], code: item.code[lang], tests: item.tests, compare: item.compare ?? "exact" };
    case "explain":
      return { ...base, prompt: item.prompt };
  }
}

export function createApp(cfg: Config) {
  const { db } = cfg;
  const now = cfg.now ?? (() => Date.now());
  const trialDays = cfg.trialDays ?? 3;
  const adminSessions = new Set<string>();
  const app = new Hono();

  // ---------------------------------------------------------------- helpers
  const student = (c: Context): StudentRow | null => {
    const token = getCookie(c, "pillow");
    if (!token) return null;
    return (db.prepare("SELECT * FROM students WHERE token = ?").get(token) as unknown as StudentRow) ?? null;
  };
  const setLogin = (c: Context, token: string) =>
    setCookie(c, "pillow", token, { httpOnly: true, sameSite: "Lax", secure: !!cfg.secureCookies, path: "/", maxAge: 60 * 60 * 24 * 365 });

  const profileOf = (s: StudentRow): Profile | null =>
    s.destination && s.test_date && s.hours && s.language
      ? { destination: s.destination as Destination, testDate: s.test_date, hours: s.hours as Hours, language: s.language as Language }
      : null;

  function access(s: StudentRow, rows: SessionRow[]) {
    const fix = rows.find((r) => r.kind === "fix" && r.finished_at);
    const trialEnds = fix ? fix.finished_at! + trialDays * DAY : null;
    const paid = s.paid !== "none";
    return { paid: s.paid, trialEnds: trialEnds ? new Date(trialEnds).toISOString() : null, allowed: !fix || paid || now() < trialEnds! };
  }

  function summary(s: StudentRow) {
    const profile = profileOf(s);
    const h = history(db, s.id);
    const passedMock = mockPassed(h.attempts);
    const pos = profile ? position(profile, h.attempts, h.sessions, now(), passedMock) : null;
    const fixRow = h.rows.find((r) => r.kind === "fix" && r.finished_at);
    const openFix = h.rows.find((r) => r.kind === "fix" && !r.finished_at);
    const stage = !profile ? "goal" : !s.finish_confirmed_at ? "finish-line" : !fixRow ? "check" : "active";
    return {
      student: { name: s.name, email: s.email, destination: s.destination, company: s.company, testDate: s.test_date, hours: s.hours, language: s.language, nextSessionAt: s.next_session_at, outcome: s.outcome, link: `/k/${s.token}` },
      stage, openFixId: openFix?.id ?? null,
      destination: profile ? DESTINATIONS[profile.destination] : null,
      position: pos && fixRow ? {
        ...pos,
        states: Object.fromEntries(Object.entries(pos.states).map(([k, v]) => [k, { status: v.status, name: TOPIC[k].name, tier: TOPIC[k].tier, last: v.evidence.at(-1)?.note ?? null }])),
        gaps: pos.gaps.map((g) => ({ ...g, name: TOPIC[g.topic].name })),
        unknownCore: pos.unknownCore.map((t) => TOPIC[t].name),
        skipNames: pos.skip.map((t) => TOPIC[t].name),
        mockPassed: passedMock,
        pendingReviews: h.attempts.filter((a) => a.score === null && a.note !== SKIPPED).length,
      } : null,
      access: access(s, h.rows),
      price: cfg.price ?? 499,
      upiId: cfg.upiId ?? null,
      weeklyCount: h.rows.filter((r) => r.kind === "weekly" && r.finished_at).length,
    };
  }

  const json = async <T>(c: Context): Promise<T> => {
    try { return (await c.req.json()) as T; } catch { return {} as T; }
  };
  const needStudent = (c: Context) => {
    const s = student(c);
    if (!s) throw new HttpError(401, "Sign in first.");
    return s;
  };

  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json({ error: err.message }, err.status as 400);
    console.error(err);
    return c.json({ error: "Something went wrong on our side. Try again." }, 500);
  });

  // ---------------------------------------------------------------- account
  app.post("/api/signup", async (c) => {
    const b = await json<{ name?: string; email?: string; whatsapp?: string; consent?: boolean }>(c);
    const name = (b.name ?? "").trim(), email = (b.email ?? "").trim(), whatsapp = (b.whatsapp ?? "").trim();
    if (!name || !email.includes("@") || !whatsapp) throw new HttpError(400, "Add your name, email and WhatsApp number.");
    if (!b.consent) throw new HttpError(400, "Please agree to how your results are used.");
    const token = randomBytes(18).toString("base64url");
    db.prepare("INSERT INTO students (token, name, email, whatsapp, created_at) VALUES (?, ?, ?, ?, ?)").run(token, name.slice(0, 80), email.slice(0, 120), whatsapp.slice(0, 40), now());
    setLogin(c, token);
    return c.json({ ok: true });
  });

  // Private sign-in link, for opening Pillow on another device.
  app.get("/k/:token", (c) => {
    const s = db.prepare("SELECT token FROM students WHERE token = ?").get(c.req.param("token")) as { token: string } | undefined;
    if (s) setLogin(c, s.token);
    return c.redirect("/");
  });

  app.get("/api/me", (c) => {
    const s = student(c);
    return c.json(s ? summary(s) : { stage: "welcome" });
  });

  app.post("/api/goal", async (c) => {
    const s = needStudent(c);
    const b = await json<{ destination?: string; testDate?: string; hours?: string; language?: string; company?: string }>(c);
    if (!DESTS.includes(b.destination as Destination)) throw new HttpError(400, "Choose what you’re preparing for.");
    if (!b.testDate || !/^\d{4}-\d{2}-\d{2}$/.test(b.testDate)) throw new HttpError(400, "Pick the test date.");
    if (!HOURS.includes(b.hours as Hours)) throw new HttpError(400, "Choose how many hours a week you have.");
    if (b.language !== "python" && b.language !== "javascript") throw new HttpError(400, "Choose Python or JavaScript.");
    db.prepare("UPDATE students SET destination = ?, test_date = ?, hours = ?, language = ?, company = ?, goal_at = ? WHERE id = ?")
      .run(b.destination!, b.testDate, b.hours!, b.language, (b.company ?? "").slice(0, 60) || null, now(), s.id);
    return c.json({ ok: true });
  });

  app.post("/api/finish-line", (c) => {
    const s = needStudent(c);
    db.prepare("UPDATE students SET finish_confirmed_at = ? WHERE id = ?").run(now(), s.id);
    return c.json({ ok: true });
  });

  // ---------------------------------------------------------------- sessions
  const itemFor = (s: StudentRow, id: string) => publicItem(ITEM[id], (s.language ?? "python") as Language);

  function planOf(row: SessionRow): string[] { return row.plan ? (JSON.parse(row.plan) as string[]) : []; }
  function answered(row: SessionRow) {
    return db.prepare("SELECT item_id, score FROM attempts WHERE session_id = ? ORDER BY id").all(row.id) as { item_id: string; score: number | null }[];
  }
  function nextInSession(row: SessionRow): string | null {
    const done = answered(row);
    if (row.kind === "fix") return nextFixItem(done.map((d) => ({ itemId: d.item_id, score: d.score })));
    const plan = planOf(row);
    return plan[done.length] ?? null;
  }
  function sessionView(s: StudentRow, row: SessionRow) {
    const next = nextInSession(row);
    const total = row.kind === "fix" ? FIX_LENGTH : planOf(row).length;
    const done = answered(row).length;
    return { sessionId: row.id, kind: row.kind, index: done, total, item: next ? itemFor(s, next) : null, topic: row.topic ? TOPIC[row.topic].name : null };
  }

  app.post("/api/sessions", async (c) => {
    const s = needStudent(c);
    const b = await json<{ kind?: SessionKind; minutes?: number }>(c);
    const profile = profileOf(s);
    if (!profile) throw new HttpError(400, "Set your goal first.");
    const h = history(db, s.id);
    const kind = b.kind;
    if (kind !== "fix" && !access(s, h.rows).allowed) throw new HttpError(402, "Your free days are over. Start your season to keep going.");

    if (kind === "fix") {
      const open = h.rows.find((r) => r.kind === "fix" && !r.finished_at);
      const row = open ?? (db.prepare("INSERT INTO sessions (student_id, kind, created_at) VALUES (?, 'fix', ?) RETURNING *").get(s.id, now()) as unknown as SessionRow);
      return c.json(sessionView(s, row));
    }
    if (kind === "weekly" || kind === "mock") {
      const plan = kind === "weekly" ? weeklyItems({ profile, attempts: h.attempts, sessions: h.sessions }) : mockItems(h.attempts);
      const row = db.prepare("INSERT INTO sessions (student_id, kind, created_at, plan) VALUES (?, ?, ?, ?) RETURNING *").get(s.id, kind, now(), JSON.stringify(plan)) as unknown as SessionRow;
      return c.json(sessionView(s, row));
    }
    if (kind === "daily") {
      const minutes = [10, 25, 60].includes(Number(b.minutes)) ? Number(b.minutes) : 25;
      const next = chooseNext({ profile, attempts: h.attempts, sessions: h.sessions, minutes, now: now(), mockPassed: mockPassed(h.attempts) });
      if (next.kind !== "check" && next.kind !== "practice") throw new HttpError(409, "Today’s step isn’t a daily task. Reload the app.");
      const checkId = next.kind === "check" ? next.itemId : next.checkItemId;
      const practice = next.kind === "practice" ? next.practice : null;
      const ref = practice ? (practice.type === "code" ? `code:${practice.itemId}` : `lc:${practice.num}`) : null;
      const plan = practice?.type === "code" ? [practice.itemId, checkId] : [checkId];
      const row = db.prepare("INSERT INTO sessions (student_id, kind, created_at, minutes, topic, plan, practice_ref) VALUES (?, 'daily', ?, ?, ?, ?, ?) RETURNING *")
        .get(s.id, now(), minutes, next.topic, JSON.stringify(plan), ref) as unknown as SessionRow;
      return c.json({ ...sessionView(s, row), why: next.why, practice: practice?.type === "leetcode" ? practice : null, practiceInApp: practice?.type === "code" });
    }
    throw new HttpError(400, "Unknown session type.");
  });

  app.get("/api/sessions/:id", (c) => {
    const s = needStudent(c);
    const row = db.prepare("SELECT * FROM sessions WHERE id = ? AND student_id = ?").get(Number(c.req.param("id")), s.id) as unknown as SessionRow | undefined;
    if (!row) throw new HttpError(404, "That session doesn’t exist.");
    return c.json(sessionView(s, row));
  });

  app.post("/api/sessions/:id/answer", async (c) => {
    const s = needStudent(c);
    const row = db.prepare("SELECT * FROM sessions WHERE id = ? AND student_id = ?").get(Number(c.req.param("id")), s.id) as unknown as SessionRow | undefined;
    if (!row) throw new HttpError(404, "That session doesn’t exist.");
    if (row.finished_at) throw new HttpError(409, "This session is already finished.");
    const b = await json<{ itemId?: string; confidence?: number; response?: Response; seconds?: number }>(c);
    const expected = nextInSession(row);
    if (!b.itemId || b.itemId !== expected) throw new HttpError(409, "That answer is for a different question. Reload to continue.");
    if (!b.response || typeof b.response !== "object") throw new HttpError(400, "Missing answer.");
    const item = ITEM[b.itemId];
    const before = topicStates(history(db, s.id).attempts);
    // Time comes from the client's timer, alongside the answer rather than inside it.
    const seconds = Math.max(0, Math.round(Number(b.seconds) || 0));
    const response = { ...b.response, seconds } as Response;
    const { score, note } = scoreResponse(item, response, (s.language ?? "python") as Language);
    const conf = Number.isInteger(b.confidence) && b.confidence! >= 1 && b.confidence! <= 5 ? b.confidence! : null;
    db.prepare("INSERT INTO attempts (session_id, student_id, item_id, confidence, response, score, note, seconds, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(row.id, s.id, item.id, conf, JSON.stringify(response).slice(0, 20000), score, note, seconds, now());

    const following = nextInSession(row);
    if (!following) db.prepare("UPDATE sessions SET finished_at = ? WHERE id = ?").run(now(), row.id);

    const after = topicStates(history(db, s.id).attempts);
    const same = (x: string, y: string) => x.replace("*", "") === y.replace("*", "");
    const moved = TOPICS.filter((t) => !same(before[t.id].status, after[t.id].status) && item.topics.includes(t.id))
      .map((t) => ({ topic: t.name, from: before[t.id].status, to: after[t.id].status }));
    return c.json({ score, note, moved, done: !following, next: following ? sessionView(s, { ...row, finished_at: null }) : null });
  });

  app.post("/api/sessions/:id/practice", async (c) => {
    const s = needStudent(c);
    const b = await json<{ done?: string }>(c);
    if (!["yes", "partial", "no"].includes(b.done ?? "")) throw new HttpError(400, "Say whether you finished it.");
    db.prepare("UPDATE sessions SET practice_done = ? WHERE id = ? AND student_id = ? AND kind = 'daily'").run(b.done!, Number(c.req.param("id")), s.id);
    return c.json({ ok: true });
  });

  app.get("/api/next", (c) => {
    const s = needStudent(c);
    const profile = profileOf(s);
    if (!profile) return c.json({ kind: "goal" });
    const h = history(db, s.id);
    const minutes = Number(c.req.query("minutes")) || 25;
    const next = chooseNext({ profile, attempts: h.attempts, sessions: h.sessions, minutes, now: now(), mockPassed: mockPassed(h.attempts) });
    const named = "topic" in next ? { topicName: TOPIC[next.topic].name } : {};
    const practice = next.kind === "practice" ? { practiceTitle: next.practice.type === "code" ? ITEM[next.practice.itemId].title : next.practice.title } : {};
    return c.json({ ...next, ...named, ...practice, access: access(s, h.rows) });
  });

  app.post("/api/next-session", async (c) => {
    const s = needStudent(c);
    const b = await json<{ at?: string }>(c);
    if (!b.at || Number.isNaN(Date.parse(b.at))) throw new HttpError(400, "Pick a time.");
    db.prepare("UPDATE students SET next_session_at = ? WHERE id = ?").run(new Date(b.at).toISOString(), s.id);
    return c.json({ ok: true });
  });

  app.post("/api/pay/claim", (c) => {
    const s = needStudent(c);
    if (s.paid === "none") db.prepare("UPDATE students SET paid = 'claimed', paid_at = ? WHERE id = ?").run(now(), s.id);
    return c.json({ ok: true });
  });

  app.post("/api/outcome", async (c) => {
    const s = needStudent(c);
    const b = await json<{ result?: string; topics?: string[]; next?: string }>(c);
    if (!["passed", "failed", "waiting"].includes(b.result ?? "")) throw new HttpError(400, "Choose how it went.");
    db.prepare("UPDATE students SET outcome = ?, outcome_topics = ?, outcome_next = ?, outcome_at = ? WHERE id = ?")
      .run(b.result!, JSON.stringify((b.topics ?? []).slice(0, 20)), (b.next ?? "").slice(0, 40) || null, now(), s.id);
    return c.json({ ok: true });
  });

  // ---------------------------------------------------------------- admin
  const isAdmin = (c: Context) => {
    const t = getCookie(c, "pillow_admin");
    return !!t && adminSessions.has(t);
  };
  const needAdmin = (c: Context) => {
    if (!cfg.adminPassword) throw new HttpError(403, "Admin is off. Set ADMIN_PASSWORD to turn it on.");
    if (!isAdmin(c)) throw new HttpError(401, "Sign in as admin.");
  };

  app.post("/api/admin/login", async (c) => {
    if (!cfg.adminPassword) throw new HttpError(403, "Admin is off. Set ADMIN_PASSWORD to turn it on.");
    const b = await json<{ password?: string }>(c);
    const a = Buffer.from(b.password ?? ""), e = Buffer.from(cfg.adminPassword);
    if (a.length !== e.length || !timingSafeEqual(a, e)) throw new HttpError(401, "Wrong password.");
    const t = randomBytes(24).toString("base64url");
    adminSessions.add(t);
    setCookie(c, "pillow_admin", t, { httpOnly: true, sameSite: "Strict", secure: !!cfg.secureCookies, path: "/", maxAge: 60 * 60 * 12 });
    return c.json({ ok: true });
  });

  function overview() {
    const students = db.prepare("SELECT * FROM students ORDER BY id DESC").all() as unknown as StudentRow[];
    const sessions = db.prepare("SELECT * FROM sessions").all() as unknown as SessionRow[];
    const by = (sid: number) => sessions.filter((r) => r.student_id === sid);
    const rows = students.map((s) => {
      const ss = by(s.id);
      const fix = ss.find((r) => r.kind === "fix" && r.finished_at);
      const weeklies = ss.filter((r) => r.kind === "weekly" && r.finished_at).length;
      const dailyWeek1 = !!fix && ss.some((r) => r.kind === "daily" && r.finished_at && r.created_at <= fix.finished_at! + 7 * DAY);
      const last = Math.max(s.created_at, ...ss.map((r) => r.finished_at ?? r.created_at));
      const pos = profileOf(s) && fix ? summary(s).position : null;
      return {
        id: s.id, name: s.name, email: s.email, whatsapp: s.whatsapp, link: `/k/${s.token}`, destination: s.destination, testDate: s.test_date, hours: s.hours,
        createdAt: s.created_at, lastActive: last, startedFix: ss.some((r) => r.kind === "fix"), finishedFix: !!fix,
        dailyWeek1, dailyDone: ss.filter((r) => r.kind === "daily" && r.finished_at).length, weeklies,
        paid: s.paid, outcome: s.outcome, skipPct: pos?.skipPct ?? null, readyBy: pos ? `${pos.readyBy.from} – ${pos.readyBy.to}` : null,
        gaps: pos?.gaps.map((g) => g.name) ?? [],
      };
    });
    const count = (f: (r: (typeof rows)[number]) => boolean) => rows.filter(f).length;
    const started = count((r) => r.startedFix), finished = count((r) => r.finishedFix), second = count((r) => r.weeklies >= 2), paid = count((r) => r.paid === "confirmed");
    const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
    const reviews = (db.prepare("SELECT a.*, s.name FROM attempts a JOIN students s ON s.id = a.student_id WHERE a.score IS NULL AND a.note != ? ORDER BY a.id").all(SKIPPED) as unknown as (AttemptRow & { name: string })[])
      .map((a) => {
        const item = ITEM[a.item_id];
        return { id: a.id, student: a.name, prompt: item.kind === "explain" ? item.prompt : item.title, rubric: item.kind === "explain" ? item.rubric : [], answer: (JSON.parse(a.response) as { text?: string }).text ?? "", at: a.created_at };
      });
    return {
      funnel: {
        signedUp: rows.length, goalSet: count((r) => !!r.destination), startedFix: started, finishedFix: finished,
        dailyWeek1: count((r) => r.dailyWeek1), weekly1: count((r) => r.weeklies >= 1), weekly2: second,
        paidClaimed: count((r) => r.paid !== "none"), paidConfirmed: paid, outcomes: count((r) => !!r.outcome),
      },
      killCriteria: [
        { metric: "Finished the 15-minute check ÷ started it", threshold: "≥ 50%", actual: `${pct(finished, started)}% (${finished}/${started})`, pass: started > 0 && finished / started >= 0.5 },
        { metric: "Did the second weekly check-in ÷ finished the check", threshold: "≥ 30%", actual: `${pct(second, finished)}% (${second}/${finished})`, pass: finished > 0 && second / finished >= 0.3 },
        { metric: "Paid (confirmed)", threshold: "≥ 5", actual: String(paid), pass: paid >= 5 },
      ],
      students: rows,
      reviews,
    };
  }

  app.get("/api/admin/overview", (c) => {
    needAdmin(c);
    return c.json(overview());
  });

  app.post("/api/admin/review", async (c) => {
    needAdmin(c);
    const b = await json<{ attemptId?: number; score?: number }>(c);
    if (![0, 1, 2, 3].includes(Number(b.score))) throw new HttpError(400, "Score must be 0 to 3.");
    const a = db.prepare("SELECT * FROM attempts WHERE id = ?").get(Number(b.attemptId)) as unknown as AttemptRow | undefined;
    if (!a) throw new HttpError(404, "No such answer.");
    const title = ITEM[a.item_id].title;
    const note = Number(b.score) >= 2 ? `Explained “${title}” clearly` : `Explanation of “${title}” had gaps`;
    db.prepare("UPDATE attempts SET score = ?, note = ?, reviewed_at = ? WHERE id = ?").run(Number(b.score), note, now(), a.id);
    return c.json({ ok: true });
  });

  app.post("/api/admin/paid", async (c) => {
    needAdmin(c);
    const b = await json<{ studentId?: number; paid?: string }>(c);
    if (!["none", "claimed", "confirmed"].includes(b.paid ?? "")) throw new HttpError(400, "Bad status.");
    db.prepare("UPDATE students SET paid = ?, paid_at = ? WHERE id = ?").run(b.paid!, now(), Number(b.studentId));
    return c.json({ ok: true });
  });

  app.get("/api/admin/export.csv", (c) => {
    needAdmin(c);
    const rows = db.prepare(
      `SELECT a.id, s.name, s.email, ses.kind AS session, a.item_id, a.confidence, a.score, a.seconds, a.note, datetime(a.created_at / 1000, 'unixepoch') AS at
       FROM attempts a JOIN students s ON s.id = a.student_id JOIN sessions ses ON ses.id = a.session_id ORDER BY a.id`,
    ).all() as Record<string, unknown>[];
    const cols = ["id", "name", "email", "session", "item_id", "confidence", "score", "seconds", "note", "at"];
    const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const body = [cols.join(","), ...rows.map((r) => cols.map((k) => esc(r[k])).join(","))].join("\n");
    return c.body(body, 200, { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=pillow-attempts.csv" });
  });

  return app;
}
