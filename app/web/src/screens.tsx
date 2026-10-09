import { useEffect, useRef, useState } from "react";
import type { Language } from "../../shared/content/items";
import { DESTINATIONS, type Destination } from "../../shared/content/topics";
import { api, type Me, type SessionView } from "./api";
import { warmUp } from "./runner";
import { SessionRunner } from "./SessionRunner";
import { Button, Card, Chips, ErrorLine, Mark, Screen, fmtDate } from "./ui";

type Nav = (path: string) => void;

// ------------------------------------------------------------------ 1 · welcome and sign-up
export function Welcome({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/signup", { name, email, whatsapp, consent });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div className="hero">
        <Mark size={52} />
        <h1>Pillow</h1>
        <p className="lede">Know what to skip before your coding interview.</p>
        <p className="muted">A 15-minute check finds your level. Then a short task each day on your weak spots, until you’re ready.</p>
      </div>
      <form className="stack" onSubmit={submit}>
        <label className="field"><span className="label">Your name</span><input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
        <label className="field"><span className="label">Email</span><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label className="field"><span className="label">WhatsApp number</span><input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} autoComplete="tel" inputMode="tel" required /></label>
        <label className="consent">
          <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>My results are used only to help me prepare and to improve Pillow. They’re never shared with my college or any employer, and I can ask for them to be deleted.</span>
        </label>
        <ErrorLine error={error} />
        <Button type="submit" disabled={busy}>Continue</Button>
        <p className="muted small center">The check and your result are free.</p>
      </form>
    </Screen>
  );
}

// ------------------------------------------------------------------ 2 · goal
const HOURS = ["2-3", "4-6", "7-10", "10+"] as const;
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export function Goal({ onDone }: { onDone: () => void }) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [testDate, setTestDate] = useState(inDays(42));
  const [company, setCompany] = useState("");
  const [hours, setHours] = useState<(typeof HOURS)[number] | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await api("/api/goal", { destination, testDate, hours, language, company });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Screen>
      <h1 className="h-screen">What are you preparing for?</h1>
      <div className="options" role="radiogroup" aria-label="Test type">
        {(Object.keys(DESTINATIONS) as Destination[]).map((d) => (
          <button key={d} type="button" role="radio" aria-checked={destination === d} className={`opt ${destination === d ? "on" : ""}`} onClick={() => setDestination(d)}>
            <i aria-hidden="true" />{DESTINATIONS[d].label}
          </button>
        ))}
      </div>
      <Card>
        <label className="field"><span className="label">When is it?</span><input id="testDate" type="date" min={inDays(1)} value={testDate} onChange={(e) => setTestDate(e.target.value)} /></label>
        <p className="muted small">No exact date? Pick your best guess. You can change it later.</p>
        <label className="field"><span className="label">Company (optional)</span><input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Amazon" /></label>
      </Card>
      <Card>
        <div className="label">Hours a week you can practise</div>
        <Chips options={HOURS} value={hours} onChange={setHours} />
        <div className="label" style={{ marginTop: 14 }}>Language</div>
        <Chips options={["python", "javascript"] as const} value={language} onChange={setLanguage} labels={{ python: "Python", javascript: "JavaScript" }} />
        <p className="muted small">Java and C++ are coming later.</p>
      </Card>
      <ErrorLine error={error} />
      <Button onClick={save} disabled={!destination || !hours || !language}>Continue</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 3 · the finish line
export function FinishLine({ me, onDone, onEdit }: { me: Me; onDone: () => void; onEdit: () => void }) {
  const d = me.destination!;
  return (
    <Screen>
      <p className="eyebrow">{d.label}{me.student?.testDate ? ` · ${fmtDate(me.student.testDate)}` : ""}</p>
      <h1 className="h-screen">Here’s what passing looks like</h1>
      <Card label="The test" tone="blue"><p><b>{d.test}</b></p></Card>
      <Card label="Usually covers" tone="blue"><div className="chips">{d.covers.map((c) => <span key={c} className="chip">{c}</span>)}</div></Card>
      <Card label="You’re ready when" tone="blue"><p>{d.readyRule}</p></Card>
      <Button onClick={async () => { await api("/api/finish-line", {}); onDone(); }}>Looks right</Button>
      <Button kind="secondary" onClick={onEdit}>Change my goal</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 4–8 · the 15-minute check
export function CheckFlow({ me, onDone }: { me: Me; onDone: () => void }) {
  const [session, setSession] = useState<SessionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const language = (me.student?.language ?? "python") as Language;
  useEffect(() => { warmUp(language).catch(() => {}); }, [language]);

  const start = async () => {
    try {
      setSession(await api<SessionView>("/api/sessions", { kind: "fix" }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (session) {
    return <Screen><SessionRunner start={session} language={language} label="Your check" onDone={onDone} /></Screen>;
  }
  const resuming = !!me.openFixId;
  return (
    <Screen>
      <h1 className="h-screen">About 15 minutes.<br />8 short checks.</h1>
      <Card>
        <ul className="bullets">
          <li><b>It finds what you can skip.</b> There’s no score to pass.</li>
          <li><b>No hints, by design.</b> Otherwise we can’t tell what you know.</li>
          <li><b>Private.</b> Never shared with your college or any employer.</li>
        </ul>
      </Card>
      <Card label="Before each check"><p>We’ll ask how confident you feel, from 1 to 5.</p></Card>
      <ErrorLine error={error} />
      <Button onClick={start}>{resuming ? "Pick up where you left off" : "Start the check"}</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 9 · the result
const VERDICT = {
  ready: () => "You’ve covered everything. Take a timed mock to confirm.",
  "on-track": (d: string) => `Your test is ${d}. You’re on track.`,
  tight: (d: string) => `Your test is ${d}. That’s tight, so keep a steady pace.`,
  "at-risk": (d: string) => `Your test is ${d}. At this pace you’d be late. Add a little time each week if you can.`,
};

export function Result({ me, go }: { me: Me; go: Nav }) {
  const p = me.position!;
  const test = fmtDate(me.student?.testDate);
  return (
    <Screen>
      <p className="eyebrow">{me.destination?.label} · {test}</p>
      <h1 className="h-screen">Here’s where you stand</h1>
      <Card label={p.skipPct > 0 ? `You can skip about ${p.skipPct}%` : "Nothing to skip yet"} tone="good">
        {p.skipNames.length ? <div className="chips">{p.skipNames.map((n) => <span key={n} className="chip st-solid">{n}</span>)}</div> : <p className="muted">That’s fine. We’ll build from the basics.</p>}
      </Card>
      {p.gaps.length > 0 && (
        <Card label={`Your ${p.gaps.length === 1 ? "real gap" : `${p.gaps.length} real gaps`}`} tone="bad">
          <ul className="gaps">{p.gaps.map((g) => <li key={g.topic}><b>{g.name}</b>{g.evidence && <span>{g.evidence}.</span>}</li>)}</ul>
        </Card>
      )}
      {p.unknownCore.length > 0 && (
        <Card label="Not checked yet"><p>{p.unknownCore.slice(0, 6).join(", ")}{p.unknownCore.length > 6 ? ` and ${p.unknownCore.length - 6} more` : ""}. Your daily tasks and weekly check-in cover them.</p></Card>
      )}
      <Card label="Rough ready-by" tone="blue">
        <p className="big-date">{fmtDate(p.readyBy.from)} – {fmtDate(p.readyBy.to)}</p>
        <p className="muted">{VERDICT[p.readyBy.verdict](test)} It’s a rough estimate and gets sharper each week.</p>
      </Card>
      {p.pendingReviews > 0 && <p className="muted small">Your explanation is waiting for review. Your result updates when it’s scored.</p>}
      <Button onClick={() => go(me.access?.paid === "none" ? "/season" : "/")}>Start today’s task</Button>
    </Screen>
  );
}

// ------------------------------------------------------------------ 10 · start your season
export function Season({ me, go, refresh }: { me: Me; go: Nav; refresh: () => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const a = me.access!;
  const inTrial = a.allowed && a.paid === "none";
  const claim = async () => { await api("/api/pay/claim", {}); await refresh(); go("/"); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(me.upiId ?? ""); setCopied(true); } catch { /* the id is visible to copy by hand */ }
  };
  return (
    <Screen>
      <h1 className="h-screen">Keep going until {fmtDate(me.student?.testDate)}</h1>
      <Card>
        <ul className="bullets">
          <li>A task every day, sized to the time you have</li>
          <li>A 10-minute check-in each week that updates your plan</li>
          <li>A ready-by date that gets sharper</li>
          <li>The “you’re ready” call, after a timed mock</li>
        </ul>
      </Card>
      <Card>
        <p className="price">₹{me.price}</p>
        <p className="muted center">once, for your whole season · no subscription</p>
        {me.upiId ? (
          <div className="upi">
            <span className="label">Pay by UPI to</span>
            <div className="row"><code className="upi-id">{me.upiId}</code><Button kind="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button></div>
            <p className="muted small">Then tap the button below. We confirm payments by hand within a day.</p>
          </div>
        ) : <p className="muted small center">Payments aren’t set up yet, so it’s free for now.</p>}
      </Card>
      {me.upiId && <Button onClick={claim}>I’ve paid</Button>}
      {inTrial && <Button kind="secondary" onClick={() => go("/")}>Try it free until {fmtDate(a.trialEnds)}</Button>}
      {!me.upiId && <Button onClick={() => go("/")}>Continue</Button>}
      <p className="muted small center">Your result stays free either way.</p>
    </Screen>
  );
}

/** Runs once even under React's development double-mount. */
export function useOnce(fn: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fn();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
