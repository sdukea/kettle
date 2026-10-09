import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import type { Language } from "../../shared/content/items";
import type { Choice, PublicItem } from "./api";
// The editor is the heaviest part of the app, so it loads only when a code question appears.
const LazyEditor = lazy(() => import("./Editor").then((m) => ({ default: m.Editor })));
function Editor(props: React.ComponentProps<typeof LazyEditor>) {
  return <Suspense fallback={<div className="editor loading">Loading the editor…</div>}><LazyEditor {...props} /></Suspense>;
}
import { runTests, warmUp, type RunResult } from "./runner";
import { Button, Timer } from "./ui";

export interface Submitted { response: Record<string, unknown>; seconds: number }

/** Asks how confident the student is, then shows the item and starts its timer. */
export function ItemView({ item, language, onSubmit, busy }: { item: PublicItem; language: Language; onSubmit: (s: Submitted, confidence: number | null) => void; busy: boolean }) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    setConfidence(null);
    if (item.kind === "code" || item.kind === "bug") warmUp(language).catch(() => {});
  }, [item.id, item.kind, language]);

  if (confidence === null) {
    return (
      <div className="stack">
        <p className="eyebrow">{item.kind === "explain" ? "Explain" : item.kind === "code" ? "Write the code" : item.kind === "bug" ? "Find the bug" : "Choose the approach"}</p>
        <h2 className="h-item">How confident are you?</h2>
        <div className="chips">{item.topics.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        <div className="confidence" role="group" aria-label="Confidence from 1 to 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className="conf" onClick={() => { setConfidence(n); setStartedAt(Date.now()); }}>{n}</button>
          ))}
        </div>
        <div className="conf-legend"><span>Not at all</span><span>Very</span></div>
      </div>
    );
  }

  const submit = (response: Record<string, unknown>) => onSubmit({ response, seconds: Math.round((Date.now() - startedAt) / 1000) }, confidence);
  const header = (
    <div className="item-head">
      <span className="eyebrow">{item.title}{item.lc ? ` · LeetCode ${item.lc.num}` : ""}</span>
      <Timer minutes={item.minutes} startedAt={startedAt} />
    </div>
  );

  switch (item.kind) {
    case "code": return <CodeView item={item} language={language} header={header} onSubmit={submit} busy={busy} />;
    case "bug": return <BugView item={item} language={language} header={header} onSubmit={submit} busy={busy} />;
    case "approach": return <ApproachView item={item} header={header} onSubmit={submit} busy={busy} />;
    case "mcq": return <McqView item={item} header={header} onSubmit={submit} busy={busy} />;
    case "explain": return <ExplainView item={item} header={header} onSubmit={submit} busy={busy} />;
  }
}

type ViewProps<K extends PublicItem["kind"]> = { item: Extract<PublicItem, { kind: K }>; header: React.ReactNode; onSubmit: (r: Record<string, unknown>) => void; busy: boolean };

function fmtArgs(args: unknown[]) {
  return args.map((a) => JSON.stringify(a)).join(", ");
}

function RunPanel({ result, examples }: { result: RunResult | null; examples: number }) {
  if (!result) return null;
  if (result.error) return <div className="run bad">{result.error}</div>;
  return (
    <div className={`run ${result.passed === result.total ? "good" : "bad"}`}>
      <b>{result.passed === result.total ? "✓ " : ""}{result.passed} of {result.total} tests passed</b>
      {result.results.slice(0, examples).map((r, i) => (
        <div key={i} className="run-row">
          <span>{r.pass ? "✓" : "✗"}</span>
          <code>{r.error ? r.error : `got ${JSON.stringify(r.got)}`}</code>
        </div>
      ))}
      {result.total > examples && result.passed < result.total && <span className="muted">Some hidden tests failed.</span>}
    </div>
  );
}

function useRunner(language: Language, fn: string, tests: any[], compare: any) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [ranCode, setRanCode] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const run = async (c = code) => {
    setRunning(true);
    try {
      const r = await runTests(language, c, fn, tests, compare);
      setResult(r);
      setRanCode(c);
      return r;
    } finally {
      setRunning(false);
    }
  };
  /** The result for the code as it is now, running it first if it changed since the last run. */
  const latest = async () => (ranCode === code && result ? result : run());
  return { code, setCode, result, run, running, latest };
}

function CodeView({ item, language, header, onSubmit, busy }: ViewProps<"code"> & { language: Language }) {
  const r = useRunner(language, item.fn, item.tests, item.compare);
  useEffect(() => r.setCode(item.starter), [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const examples = item.tests.slice(0, 2);
  return (
    <div className="stack">
      {header}
      <h2 className="h-item">{item.title}</h2>
      <p>{item.prompt}</p>
      <div className="examples">
        {examples.map((t, i) => <code key={i}>{item.fn}({fmtArgs(t.args)}) → {JSON.stringify(t.expect)}</code>)}
      </div>
      <Editor initial={item.starter} language={language} onChange={r.setCode} label={`Your ${language} solution`} />
      <RunPanel result={r.result} examples={2} />
      <div className="row">
        <Button kind="secondary" onClick={() => r.run()} disabled={r.running}>{r.running ? "Running…" : "Run tests"}</Button>
        <Button disabled={busy || r.running} onClick={async () => {
          const res = await r.latest();
          onSubmit({ kind: "code", passed: res.passed, total: res.total, code: r.code });
        }}>Submit</Button>
      </div>
      {language === "python" && <p className="muted small">Python loads in the background while you read. The first run can take a few seconds.</p>}
    </div>
  );
}

function BugView({ item, language, header, onSubmit, busy }: ViewProps<"bug"> & { language: Language }) {
  const r = useRunner(language, item.fn, item.tests, item.compare);
  const [line, setLine] = useState<number | null>(null);
  useEffect(() => { r.setCode(item.code); setLine(null); }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const lines = item.code.trimEnd().split("\n");
  return (
    <div className="stack">
      {header}
      <h2 className="h-item">This code has one bug.</h2>
      <p>First tap the line that’s wrong. Then fix it in the editor and run the tests.</p>
      <ol className="lines" aria-label="Tap the line with the bug">
        {lines.map((l, i) => (
          <li key={i}>
            <button type="button" className={line === i + 1 ? "on" : ""} onClick={() => setLine(i + 1)} aria-pressed={line === i + 1}>
              <span className="ln">{i + 1}</span><code>{l || " "}</code>
            </button>
          </li>
        ))}
      </ol>
      {line !== null && (
        <>
          <Editor initial={item.code} language={language} onChange={r.setCode} label="Your fix" />
          <RunPanel result={r.result} examples={0} />
          <div className="row">
            <Button kind="secondary" onClick={() => r.run()} disabled={r.running}>{r.running ? "Running…" : "Run tests"}</Button>
            <Button disabled={busy || r.running} onClick={async () => {
              const res = await r.latest();
              onSubmit({ kind: "bug", line, passed: res.passed, total: res.total, code: r.code });
            }}>Submit</Button>
          </div>
        </>
      )}
    </div>
  );
}

function Options({ options, value, onChange, name }: { options: Choice[]; value: number | null; onChange: (i: number) => void; name: string }) {
  return (
    <div className="options" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.i} type="button" role="radio" aria-checked={value === o.i} className={`opt ${value === o.i ? "on" : ""}`} onClick={() => onChange(o.i)}>
          <i aria-hidden="true" />{o.text}
        </button>
      ))}
    </div>
  );
}

function ApproachView({ item, header, onSubmit, busy }: ViewProps<"approach">) {
  const [s, setS] = useState<number | null>(null);
  const [c, setC] = useState<number | null>(null);
  const [why, setWhy] = useState("");
  useEffect(() => { setS(null); setC(null); setWhy(""); }, [item.id]);
  return (
    <div className="stack">
      {header}
      <h2 className="h-item">{item.title}</h2>
      <p>{item.prompt}</p>
      <div className="label">What would you use?</div>
      <Options options={item.structures} value={s} onChange={setS} name="Approach" />
      <div className="label">Time complexity</div>
      <Options options={item.complexities} value={c} onChange={setC} name="Complexity" />
      <label className="field">
        <span className="label">Why, in one line (optional)</span>
        <input value={why} onChange={(e) => setWhy(e.target.value)} maxLength={200} />
      </label>
      <Button disabled={busy || s === null || c === null} onClick={() => onSubmit({ kind: "approach", structure: s, complexity: c, why })}>Submit</Button>
    </div>
  );
}

function McqView({ item, header, onSubmit, busy }: ViewProps<"mcq">) {
  const [v, setV] = useState<number | null>(null);
  useEffect(() => setV(null), [item.id]);
  return (
    <div className="stack">
      {header}
      <h2 className="h-item">{item.prompt}</h2>
      {item.code && <pre className="snippet"><code>{item.code}</code></pre>}
      <Options options={item.options} value={v} onChange={setV} name="Answer" />
      <Button disabled={busy || v === null} onClick={() => onSubmit({ kind: "mcq", choice: v })}>Submit</Button>
    </div>
  );
}

function ExplainView({ item, header, onSubmit, busy }: ViewProps<"explain">) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const Speech = useMemo(() => (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition, []);
  useEffect(() => setText(""), [item.id]);

  const dictate = () => {
    const rec = new Speech();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const said = Array.from(e.results as ArrayLike<any>).slice(e.resultIndex).map((r: any) => r[0].transcript).join(" ");
      setText((t) => (t ? t + " " : "") + said.trim());
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
    setTimeout(() => rec.stop(), 90_000);
  };

  return (
    <div className="stack">
      {header}
      <h2 className="h-item">{item.prompt}</h2>
      <p className="muted">Answer as you would to an interviewer. A person reads this and scores it within a day.</p>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} aria-label="Your explanation" maxLength={3000} />
      {Speech && <Button kind="secondary" onClick={dictate} disabled={listening}>{listening ? "Listening… talk now" : "Say it out loud instead"}</Button>}
      <div className="row">
        <Button kind="plain" disabled={busy} onClick={() => onSubmit({ kind: "explain", text: "" })}>Skip</Button>
        <Button disabled={busy || text.trim().length < 20} onClick={() => onSubmit({ kind: "explain", text })}>Submit</Button>
      </div>
    </div>
  );
}
