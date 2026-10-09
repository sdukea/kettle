import { useState } from "react";
import type { Language } from "../../shared/content/items";
import { api, type AnswerResult, type SessionView } from "./api";
import { ItemView } from "./items";
import { ErrorLine, Progress } from "./ui";

export interface Answered { itemId: string; title: string; score: number | null; note: string; moved: AnswerResult["moved"] }

/** Walks through a session's items one at a time and reports every answer when it ends. */
export function SessionRunner({ start, language, onDone, label, showFeedback = false }: {
  start: SessionView; language: Language; onDone: (answers: Answered[]) => void; label: string; showFeedback?: boolean;
}) {
  const [view, setView] = useState(start);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Answered | null>(null);
  const [pendingGo, setPendingGo] = useState<(() => void) | null>(null);

  if (!view.item) return null;
  const item = view.item;

  const submit = async (s: { response: Record<string, unknown>; seconds: number }, confidence: number | null) => {
    setBusy(true);
    setError(null);
    try {
      const r = await api<AnswerResult>(`/api/sessions/${view.sessionId}/answer`, { itemId: item.id, confidence, response: s.response, seconds: s.seconds });
      const a: Answered = { itemId: item.id, title: item.title, score: r.score, note: r.note, moved: r.moved };
      const all = [...answers, a];
      setAnswers(all);
      const go = () => (r.done || !r.next ? onDone(all) : setView(r.next));
      if (showFeedback && r.score !== null) {
        setFeedback(a);
        setPendingGo(() => go);
      } else go();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (feedback) {
    const good = (feedback.score ?? 0) >= 2;
    return (
      <div className="stack">
        <p className="eyebrow">{label}</p>
        <h2 className={`h-item ${good ? "good" : ""}`}>{good ? "Nice. That’s right." : "Not quite this time."}</h2>
        <p>{feedback.note}.</p>
        <button type="button" className="btn primary" onClick={() => { setFeedback(null); pendingGo?.(); }}>Continue</button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="runner-top">
        <span className="eyebrow">{label} · {view.index + 1} of {view.total}</span>
        <Progress value={(view.index / Math.max(1, view.total)) * 100} />
      </div>
      <ItemView key={item.id} item={item} language={language} onSubmit={submit} busy={busy} />
      <ErrorLine error={error} />
    </div>
  );
}
