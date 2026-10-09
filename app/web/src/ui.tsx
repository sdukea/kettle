import { useEffect, useState, type ReactNode } from "react";
import type { Status } from "./api";

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path d="M3.5 5.5Q10 3 16.5 5.5Q18 10 16.5 14.5Q10 17 3.5 14.5Q2 10 3.5 5.5Z" fill="var(--dot-soft)" stroke="var(--dot)" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.8" fill="var(--dot)" />
    </svg>
  );
}

export function Screen({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <main className={wide ? "screen wide" : "screen"}>{children}</main>;
}

export function Button({ children, onClick, kind = "primary", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "secondary" | "plain"; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} className={`btn ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Card({ children, label, tone }: { children: ReactNode; label?: string; tone?: "good" | "bad" | "blue" | "warn" }) {
  return (
    <section className="card">
      {label && <div className={`label ${tone ?? ""}`}>{label}</div>}
      {children}
    </section>
  );
}

const STATUS_TEXT: Record<Status, string> = { solid: "Solid", "solid*": "Solid", shaky: "Shaky", gap: "Gap", unknown: "Not checked" };
export function StatusChip({ status }: { status: Status }) {
  return <span className={`chip st-${status.replace("*", "-implied")}`}>{STATUS_TEXT[status]}</span>;
}

export function Chips<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T | null; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} className={`chip pick ${value === o ? "on" : ""}`} onClick={() => onChange(o)}>
          {labels?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}

export function ErrorLine({ error }: { error: string | null }) {
  return error ? <p className="error" role="alert">{error}</p> : null;
}

/** Counts down from the time box. Keeps counting into overtime instead of cutting the student off. */
export function Timer({ minutes, startedAt }: { minutes: number; startedAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.round(minutes * 60 - (now - startedAt) / 1000);
  const abs = Math.abs(left);
  const text = `${left < 0 ? "+" : ""}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`;
  return <span className={`timer ${left < 0 ? "over" : ""}`} aria-label={left < 0 ? "Over time" : "Time left"}>{text}</span>;
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function Progress({ value }: { value: number }) {
  return <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.max(3, value)}%` }} /></div>;
}
