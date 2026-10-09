import { useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { Button, ErrorLine, Screen, fmtDate } from "./ui";

interface Overview {
  funnel: Record<string, number>;
  killCriteria: { metric: string; threshold: string; actual: string; pass: boolean }[];
  students: {
    id: number; name: string; email: string; whatsapp: string; link: string; destination: string | null; testDate: string | null; hours: string | null;
    lastActive: number; finishedFix: boolean; dailyDone: number; weeklies: number; paid: string; outcome: string | null;
    skipPct: number | null; readyBy: string | null; gaps: string[];
  }[];
  reviews: { id: number; student: string; prompt: string; rubric: string[]; answer: string; at: number }[];
}

const FUNNEL: [string, string][] = [
  ["signedUp", "Signed up"], ["goalSet", "Set a goal"], ["startedFix", "Started the check"], ["finishedFix", "Finished the check"],
  ["dailyWeek1", "Did a daily task in week 1"], ["weekly1", "First weekly check-in"], ["weekly2", "Second weekly check-in"],
  ["paidClaimed", "Said they paid"], ["paidConfirmed", "Payment confirmed"], ["outcomes", "Reported a test result"],
];

export function Admin() {
  const [data, setData] = useState<Overview | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setData(await api<Overview>("/api/admin/overview"));
      setNeedLogin(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setNeedLogin(true);
      else setError((e as Error).message);
    }
  };
  useEffect(() => { load(); }, []);

  if (needLogin) {
    return (
      <Screen>
        <h1 className="h-screen">Pillow admin</h1>
        <form className="stack" onSubmit={async (e) => { e.preventDefault(); try { await api("/api/admin/login", { password }); await load(); } catch (err) { setError((err as Error).message); } }}>
          <label className="field"><span className="label">Password</span><input id="adminPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          <ErrorLine error={error} />
          <Button type="submit">Sign in</Button>
        </form>
      </Screen>
    );
  }
  if (!data) return <Screen><ErrorLine error={error} /><p className="muted">Loading…</p></Screen>;

  const review = async (attemptId: number, score: number) => { await api("/api/admin/review", { attemptId, score }); await load(); };
  const setPaid = async (studentId: number, paid: string) => { await api("/api/admin/paid", { studentId, paid }); await load(); };

  return (
    <Screen wide>
      <div className="admin-head">
        <h1 className="h-screen">Pillow admin</h1>
        <a className="btn secondary" href="/api/admin/export.csv">Export answers (CSV)</a>
      </div>

      <h2 className="h-sub">Stop-or-continue thresholds</h2>
      <div className="kill">
        {data.killCriteria.map((k) => (
          <div key={k.metric} className={`kc ${k.pass ? "pass" : "fail"}`}>
            <span className="label">{k.pass ? "Passing" : "Not yet"}</span>
            <b>{k.actual}</b>
            <span>{k.metric}</span>
            <span className="muted small">Needs {k.threshold}</span>
          </div>
        ))}
      </div>

      <h2 className="h-sub">Funnel</h2>
      <div className="funnel">
        {FUNNEL.map(([k, label]) => <div key={k}><b>{data.funnel[k]}</b><span>{label}</span></div>)}
      </div>

      <h2 className="h-sub">Explanations to score ({data.reviews.length})</h2>
      {data.reviews.length === 0 && <p className="muted">Nothing waiting.</p>}
      {data.reviews.map((r) => (
        <div key={r.id} className="card review">
          <div className="label">{r.student} · {fmtDate(new Date(r.at).toISOString())}</div>
          <p><b>{r.prompt}</b></p>
          <blockquote>{r.answer}</blockquote>
          <ul className="small muted">{r.rubric.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="row">{[0, 1, 2, 3].map((s) => <Button key={s} kind="secondary" onClick={() => review(r.id, s)}>{s}</Button>)}</div>
        </div>
      ))}

      <h2 className="h-sub">Students ({data.students.length})</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Contact</th><th>Goal</th><th>Skip</th><th>Gaps</th><th>Ready-by</th><th>Daily</th><th>Weekly</th><th>Last active</th><th>Paid</th><th>Outcome</th></tr></thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td><span className="selectable">{s.whatsapp}</span><br /><span className="muted selectable">{s.email}</span><br /><span className="muted small selectable" title="Their private sign-in link. Send it to them if they lose access.">{location.origin + s.link}</span></td>
                <td>{s.destination ?? "—"}<br /><span className="muted">{s.testDate ?? ""} · {s.hours ?? ""} h</span></td>
                <td>{s.skipPct === null ? (s.finishedFix ? "—" : "No check") : `${s.skipPct}%`}</td>
                <td>{s.gaps.join(", ")}</td>
                <td>{s.readyBy ?? ""}</td>
                <td>{s.dailyDone}</td>
                <td>{s.weeklies}</td>
                <td>{new Date(s.lastActive).toLocaleDateString()}</td>
                <td>
                  <select id={`paid-${s.id}`} value={s.paid} onChange={(e) => setPaid(s.id, e.target.value)} aria-label={`Payment for ${s.name}`}>
                    <option value="none">None</option><option value="claimed">Says paid</option><option value="confirmed">Confirmed</option>
                  </select>
                </td>
                <td>{s.outcome ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Screen>
  );
}
