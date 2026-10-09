import { sameAnswer } from "../../shared/engine/compare";
import type { Compare, Language, Test } from "../../shared/content/items";

export interface TestResult { pass: boolean; args: unknown[]; expect: unknown; got?: unknown; error?: string }
export interface RunResult { passed: number; total: number; results: TestResult[]; error?: string; timedOut?: boolean }

const RUN_TIMEOUT_MS = 6000;
let worker: Worker | null = null;
let seq = 0;
const warm: Partial<Record<Language, Promise<void>>> = {};
const pending = new Map<number, (data: any) => void>();

function getWorker() {
  if (!worker) {
    worker = new Worker("/runner-worker.js", { type: "module" });
    worker.onmessage = (e) => {
      const cb = pending.get(e.data.id);
      pending.delete(e.data.id);
      cb?.(e.data);
    };
  }
  return worker;
}

function send(msg: object, timeoutMs?: number): Promise<any> {
  const id = ++seq;
  const w = getWorker();
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    pending.set(id, (d) => { if (timer) clearTimeout(timer); resolve(d); });
    if (timeoutMs) {
      timer = setTimeout(() => {
        pending.delete(id);
        // Probably an infinite loop. Throw the worker away; the next run starts a fresh one.
        w.terminate();
        if (worker === w) { worker = null; delete warm.python; }
        resolve({ id, out: { error: "Your code ran for too long. Check for an infinite loop.", timedOut: true } });
      }, timeoutMs);
    }
    w.postMessage({ id, ...msg });
  });
}

/** Load Python ahead of time so the first run doesn't count the download against the student. */
export function warmUp(language: Language): Promise<void> {
  return (warm[language] ??= send({ type: "warm", language }).then(() => undefined));
}

export async function runTests(language: Language, code: string, fn: string, tests: Test[], compare: Compare): Promise<RunResult> {
  await warmUp(language);
  const { out } = await send({ type: "run", language, code, fn, tests }, RUN_TIMEOUT_MS);
  if (out.error) return { passed: 0, total: tests.length, results: [], error: out.error, timedOut: out.timedOut };
  const results: TestResult[] = tests.map((t, i) => {
    const r = out.results[i];
    return { args: t.args, expect: t.expect, pass: !!r?.ok && sameAnswer(r.got, t.expect, compare), got: r?.got, error: r?.error };
  });
  return { passed: results.filter((r) => r.pass).length, total: tests.length, results };
}
