import { useEffect, useState } from "react";
import type { Language } from "../../shared/content/items";
import { ORDER, TOPICS, requiredLevel, type Destination } from "../../shared/content/topics";
import { api, type Me, type Next, type SessionView, type Status } from "./api";
import { SessionRunner, type Answered } from "./SessionRunner";
import { useOnce } from "./screens";
import { Button, Card, Chips, ErrorLine, Progress, Screen, StatusChip, fmtDate } from "./ui";

type Nav = (path: string) => void;
const MINUTES = ["10", "25", "60"] as const;

// ------------------------------------------------------------------ 11 · Now
export function Now({ me, go }: { me: Me; go: Nav }) {
  const [minutes, setMinutes] = useState<(typeof MINUTES)[number]>("25");
  const [next, setNext] = useState<Next | null>(null);
  const [copied, setCopied] = useState(false);
  const p = me.position!;

  useEffect(() => {
    setNext(null);
    api<Next>(`/api/next?minutes=${minutes}`).then(setNext).catch(() => setNext(null));
  }, [minutes]);

  const allowed = me.access?.allowed;
  const start = () => {
    if (!next) return;
    if (next.kind === "weekly") go("/weekly");
    else if (next.kind === "mock") go("/mock");
    else if (next.kind === "ready") go("/ready");
    else go(`/task?m=${minutes}`);
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(location.origin + me.student!.link); setCopied(true); } catch { /* shown below to copy by hand */ setCopied(true); }
  };

  return (
    <Screen>
      <p className="eyebrow">{me.destination?.label} · {fmtDate(me.student?.testDate)}</p>
      <h1 className="h-now">Now</h1>
      <p>{p.readyBy.verdict === "ready" ? "Every topic is covered." : <>Likely ready <b>{fmtDate(p.readyBy.from)} – {fmtDate(p.readyBy.to)}</b></>}</p>
      <Progress value={p.progress} />

      {!allowed ? (
        <Card label="Your free days are over" tone="blue">
          <p>Start your season to keep your daily tasks and weekly check-ins going.</p>
          <Button onClick={() => go("/season")}>Start my season</Button>
        </Card>
      ) : (
        <>
          <div className="label">How much time do you have?</div>
          <Chips options={MINUTES} value={minutes} onChange={setMinutes} labels={{ "10": "10 min", "25": "25 min", "60": "60 min" }} />
          <Card label={next ? labelFor(next, minutes) : "Picking your task…"} tone="blue">
            {next && <TaskSummary next={next} />}
          </Card>
          <Button onClick={start} disabled={!next}>Start</Button>
        </>
      )}
      {p.pendingReviews > 0 && <p className="muted small">{p.pendingReviews} explanation{p.pendingReviews > 1 ? "s" : ""} waiting for review.</p>}

      <nav className="links">
        <a href="/route" onClick={(e) => { e.preventDefault(); go("/route"); }}>Your route</a>
        <a href="/report" onClick={(e) => { e.preventDefault(); go("/report"); }}>Report a test result</a>
        <a href="/goal" onClick={(e) => { e.preventDefault(); go("/goal"); }}>Change your goal</a>
        <button type="button" className="linklike" onClick={copyLink}>{copied ? "Link copied" : "Open on another device"}</button>
      </nav>
      {copied && <p className="muted small center selectable">{location.origin + me.student!.link}</p>}
    </Screen>
  );
}

function labelFor(n: Next, minutes: string) {
  if (n.kind === "weekly") return "Weekly check-in · 10 min";
  if (n.kind === "mock") return "Timed mock · 45 min";
  if (n.kind === "ready") return "You’re ready";
  return `Now · ${n.kind === "check" ? "5" : minutes} min`;
}

function TaskSummary({ next }: { next: Next }) {
  switch (next.kind) {
    case "practice": return (<><b className="task-title">{next.topicName}</b><p>Practise one problem ({next.practiceTitle}), then answer one quick check.</p><p className="muted small">Why this: {next.why}</p></>);
    case "check": return (<><b className="task-title">{next.topicName}</b><p>One quick check.</p><p className="muted small">Why this: {next.why}</p></>);
    case "weekly": return <p>Three short checks that update your plan and your ready-by date.</p>;
    case "mock": return <p>Every topic is where it needs to be. Two problems, timed, like the real test. Pass it and you’re ready.</p>;
    case "ready": return <p>You passed the mock and every topic is solid.</p>;
    default: return null;
  }
}

// ------------------------------------------------------------------ 12–13 · the daily task
export function DailyTask({ me, go, refresh }: { me: Me; go: Nav; refresh: () => Promise<void> }) {
  const minutes = Number(new URLSearchParams(location.search).get("m") ?? 25);
  const language = (me.student?.language ?? "python") as Language;
  const [session, setSession] = useState<(SessionView & { why?: string }) | null>(null);
  const [step, setStep] = useState<"practice" | "check" | "after">("practice");
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [error, setError] = useState<string | null>(null);

  useOnce(() => {
    api<SessionView>("/api/sessions", { kind: "daily", minutes })
      .then((s) => { setSession(s); setStep(s.practice ? "practice" : "check"); })
      .catch((e) => setError(e.message));
  });

  if (error) return <Screen><ErrorLine error={error} /><Button onClick={() => go("/")}>Back</Button></Screen>;
  if (!session) return <Screen><p className="muted">Getting your task ready…</p></Screen>;

  const markPractice = async (done: "yes" | "partial" | "no") => {
    await api(`/api/sessions/${session.sessionId}/practice`, { done });
    setStep("check");
  };

  if (step === "practice" && session.practice) {
    const url = `https://leetcode.com/problems/${session.practice.slug}/`;
    return (
      <Screen>
        <p className="eyebrow">Practice · {session.topic}</p>
        <h1 className="h-screen">{session.practice.title}</h1>
        <p className="muted">Why this: {session.why}</p>
        <Card>
          <p>Solve it on LeetCode (problem {session.practice.num}). Try for 20 minutes before reading any solution.</p>
          <a className="btn secondary" href={url} target="_blank" rel="noreferrer">Open on LeetCode</a>
        </Card>
        <div className="label">When you’re back</div>
        <Button onClick={() => markPractice("yes")}>I solved it</Button>
        <Button kind="secondary" onClick={() => markPractice("partial")}>I got partway</Button>
        <Button kind="plain" onClick={() => markPractice("no")}>I didn’t get to it</Button>
      </Screen>
    );
  }

  if (step !== "after") {
    return (
      <Screen>
        {session.practiceInApp && <p className="muted">Practise one problem here, then answer one quick check. Why this: {session.why}</p>}
        <SessionRunner start={session} language={language} label={session.topic ?? "Today"} showFeedback onDone={async (a) => {
          if (session.practiceInApp) {
            const code = a[0];
            await api(`/api/sessions/${session.sessionId}/practice`, { done: (code?.score ?? 0) >= 2 ? "yes" : "partial" });
          }
          setAnswers(a);
          await refresh();
          setStep("after");
        }} />
      </Screen>
    );
  }
  return <AfterSession me={me} answers={answers} go={go} />;
}

const STATUS_WORD: Record<Status, string> = { solid: "Solid", "solid*": "Solid", shaky: "Shaky", gap: "Gap", unknown: "Not checked" };

function Moved({ answers }: { answers: Answered[] }) {
  // One line per topic: where it started this session and where it ended.
  const byTopic = new Map<string, { topic: string; from: Status; to: Status }>();
  for (const m of answers.flatMap((a) => a.moved)) {
    const prev = byTopic.get(m.topic);
    byTopic.set(m.topic, { topic: m.topic, from: prev ? prev.from : m.from, to: m.to });
  }
  const moved = [...byTopic.values()].filter((m) => m.from.replace("*", "") !== m.to.replace("*", ""));
  if (!moved.length) return <p className="muted">No topic changed level this time. That’s normal; it usually takes two or three sessions.</p>;
  return (
    <ul className="moved">
      {moved.map((m, i) => (
        <li key={i}><b>{m.topic}</b> <StatusChip status={m.from} /> → <StatusChip status={m.to} /><span className="sr-only">{STATUS_WORD[m.from]} to {STATUS_WORD[m.to]}</span></li>
      ))}
    </ul>
  );
}

function calendarLinks(at: Date) {
  const end = new Date(at.getTime() + 25 * 60_000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Pillow session")}&dates=${f(at)}/${f(end)}&details=${encodeURIComponent(location.origin)}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pillow//EN", "BEGIN:VEVENT", `UID:${at.getTime()}@pillow`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(at)}`, `DTEND:${f(end)}`, "SUMMARY:Pillow session", `DESCRIPTION:${location.origin}`, "BEGIN:VALARM", "TRIGGER:-PT5M", "ACTION:DISPLAY", "DESCRIPTION:Pillow session", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return { google, ics: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })) };
}

function tomorrowAt(h: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, 0, 0, 0);
  return d;
}

export function AfterSession({ me, answers, go }: { me: Me; answers: Answered[]; go: Nav }) {
  const [choice, setChoice] = useState<"7am" | "8pm" | "custom" | null>(null);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState<Date | null>(null);
  const p = me.position!;

  const save = async () => {
    const at = choice === "7am" ? tomorrowAt(7) : choice === "8pm" ? tomorrowAt(20) : new Date(custom);
    if (Number.isNaN(at.getTime())) return;
    await api("/api/next-session", { at: at.toISOString() });
    setSaved(at);
  };
  const links = saved ? calendarLinks(saved) : null;

  return (
    <Screen>
      <h1 className="h-screen">Done for today</h1>
      <Card label="Your position" tone="blue"><Moved answers={answers} /></Card>
      <Card label="Ready-by now"><p className="big-date">{fmtDate(p.readyBy.from)} – {fmtDate(p.readyBy.to)}</p></Card>
      {!saved ? (
        <Card label="When’s your next session?">
          <Chips options={["7am", "8pm", "custom"] as const} value={choice} onChange={setChoice} labels={{ "7am": "Tomorrow 7 am", "8pm": "Tomorrow 8 pm", custom: "Pick a time" }} />
          {choice === "custom" && <input id="nextAt" type="datetime-local" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Next session time" />}
          <p className="muted small">Deciding when you’ll do the next one makes you far more likely to do it.</p>
          <Button kind="secondary" onClick={save} disabled={!choice || (choice === "custom" && !custom)}>Save</Button>
        </Card>
      ) : (
        <Card label={`Next: ${saved.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`}>
          <div className="row">
            <a className="btn secondary" href={links!.google} target="_blank" rel="noreferrer">Add to Google Calendar</a>
            <a className="btn plain" href={links!.ics} download="pillow-session.ics">Other calendar</a>
          </div>
        </Card>
      )}
      <Button onClick={() => go("/")}>Finish</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 14 · weekly check-in and the mock
function TimedSession({ me, go, refresh, kind }: { me: Me; go: Nav; refresh: () => Promise<void>; kind: "weekly" | "mock" }) {
  const language = (me.student?.language ?? "python") as Language;
  const [session, setSession] = useState<SessionView | null>(null);
  const [answers, setAnswers] = useState<Answered[] | null>(null);
  const [started, setStarted] = useState(kind === "weekly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!started || session) return;
    api<SessionView>("/api/sessions", { kind }).then(setSession).catch((e) => setError(e.message));
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Screen><ErrorLine error={error} /><Button onClick={() => go("/")}>Back</Button></Screen>;
  if (!started) {
    return (
      <Screen>
        <h1 className="h-screen">Timed mock</h1>
        <Card><p>Two problems, like the real test. Give yourself 45 minutes, somewhere quiet, with no help. Pass both and you’re ready.</p></Card>
        <Button onClick={() => setStarted(true)}>Start the mock</Button>
        <Button kind="plain" onClick={() => go("/")}>Not now</Button>
      </Screen>
    );
  }
  if (answers) {
    const passed = answers.every((a) => (a.score ?? 0) >= 2);
    return (
      <Screen>
        {kind === "weekly" ? (
          <>
            <p className="eyebrow">Week {me.weeklyCount ?? 1}</p>
            <h1 className="h-screen">Here’s what changed</h1>
            <Card label="Moved" tone="blue"><Moved answers={answers} /></Card>
            <Card label="Ready-by now"><p className="big-date">{fmtDate(me.position!.readyBy.from)} – {fmtDate(me.position!.readyBy.to)}</p></Card>
          </>
        ) : (
          <>
            <h1 className="h-screen">{passed ? "Mock passed" : "Not this time"}</h1>
            <Card>{answers.map((a) => <p key={a.itemId}>{(a.score ?? 0) >= 2 ? "✓" : "✗"} {a.note}</p>)}</Card>
            {!passed && <p className="muted">That’s useful. Your daily tasks now focus on what slowed you down, and you can retake the mock later.</p>}
          </>
        )}
        <Button onClick={() => go(kind === "mock" && passed ? "/ready" : "/")}>Continue</Button>
      </Screen>
    );
  }
  if (!session) return <Screen><p className="muted">Getting your checks ready…</p></Screen>;
  return (
    <Screen>
      <SessionRunner start={session} language={language} label={kind === "weekly" ? "Weekly check-in" : "Timed mock"} onDone={async (a) => { await refresh(); setAnswers(a); }} />
    </Screen>
  );
}
export const Weekly = (props: { me: Me; go: Nav; refresh: () => Promise<void> }) => <TimedSession {...props} kind="weekly" />;
export const Mock = (props: { me: Me; go: Nav; refresh: () => Promise<void> }) => <TimedSession {...props} kind="mock" />;

// ------------------------------------------------------------------ 16 · your route
export function RouteView({ me, go }: { me: Me; go: Nav }) {
  const [next, setNext] = useState<Next | null>(null);
  useEffect(() => { api<Next>("/api/next?minutes=25").then(setNext).catch(() => {}); }, []);
  const p = me.position!;
  const dest = me.student!.destination as Destination;
  const current = next && "topic" in next ? next.topic : null;
  const topics = [...TOPICS].filter((t) => requiredLevel(dest, t.tier)).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const rank = (s: Status) => (s === "solid" || s === "solid*" ? 0 : 1);
  const done = topics.filter((t) => rank(p.states[t.id].status) === 0);
  const todo = topics.filter((t) => rank(p.states[t.id].status) === 1);

  return (
    <Screen>
      <h1 className="h-screen">Your route</h1>
      <p className="muted">Topics in the order they build on each other. Green ones you can skip.</p>
      <ol className="route">
        {[...done, ...todo].map((t) => (
          <li key={t.id} className={t.id === current ? "here" : rank(p.states[t.id].status) === 0 ? "done" : ""}>
            <span className="node" aria-hidden="true" />
            <span className="rname">{t.name}{t.tier === "common" && <span className="muted small"> · common</span>}</span>
            {t.id === current ? <span className="chip on">Now</span> : <StatusChip status={p.states[t.id].status} />}
          </li>
        ))}
        <li className={p.mockPassed ? "done" : ""}><span className="node" aria-hidden="true" /><span className="rname">Timed mock</span><span className="chip">{p.mockPassed ? "Passed" : "Last"}</span></li>
      </ol>
      <Button kind="secondary" onClick={() => go("/")}>Back</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 17 · ready
export function Ready({ me, go }: { me: Me; go: Nav }) {
  const p = me.position!;
  const coreSolid = Object.values(p.states).filter((s) => s.tier === "core" && (s.status === "solid" || s.status === "solid*")).length;
  return (
    <Screen>
      <div className="hero">
        <div className="ready-mark" aria-hidden="true">✓</div>
        <h1>You’re ready.</h1>
        <p className="muted">{me.destination?.label} · {fmtDate(me.student?.testDate)}</p>
      </div>
      <Card label="The evidence">
        <p>✓ {coreSolid} of 16 core topics solid</p>
        <p>✓ Timed mock passed</p>
      </Card>
      <Card label="From here" tone="blue"><p>Stop adding new topics. Do a light review the day before. Then rest easy.</p></Card>
      <Button onClick={() => go("/report")}>Took the test? Tell us how it went</Button>
      <Button kind="secondary" onClick={() => go("/")}>Back</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 18 · report the result
export function Report({ me, go, refresh }: { me: Me; go: Nav; refresh: () => Promise<void> }) {
  const [result, setResult] = useState<"passed" | "failed" | "waiting" | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [next, setNext] = useState<"interview" | "another" | "done" | null>(null);
  const [sent, setSent] = useState(false);
  const names = TOPICS.filter((t) => t.tier !== "advanced").map((t) => t.name);

  if (sent) {
    return (
      <Screen>
        <h1 className="h-screen">{result === "passed" ? "Congratulations." : result === "failed" ? "Thank you for telling us." : "Thanks. Tell us when you hear."}</h1>
        <p>{result === "failed" ? "The real test is the most useful check there is. Set your next date and Pillow will plan around what came up." : "Every result you share makes everyone’s ready-by dates more accurate."}</p>
        <Button onClick={() => go("/")}>Back</Button>
      </Screen>
    );
  }
  return (
    <Screen>
      <h1 className="h-screen">How did {me.student?.company ? `the ${me.student.company} test` : "it"} go?</h1>
      <Chips options={["passed", "failed", "waiting"] as const} value={result} onChange={setResult} labels={{ passed: "Passed", failed: "Didn’t pass", waiting: "Still waiting" }} />
      <Card label="Which topics came up? (optional)">
        <div className="chips">
          {names.map((n) => (
            <button key={n} type="button" className={`chip pick ${topics.includes(n) ? "on" : ""}`} aria-pressed={topics.includes(n)} onClick={() => setTopics((ts) => (ts.includes(n) ? ts.filter((x) => x !== n) : [...ts, n]))}>{n}</button>
          ))}
        </div>
      </Card>
      <Card label="What’s next?">
        <Chips options={["interview", "another", "done"] as const} value={next} onChange={setNext} labels={{ interview: "Interview loop", another: "Another test", done: "I’m done" }} />
      </Card>
      <Button disabled={!result} onClick={async () => { await api("/api/outcome", { result, topics, next }); await refresh(); setSent(true); }}>Send</Button>
    </Screen>
  );
}
