import type { Language, Test, Compare } from "../../shared/content/items";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T = any>(path: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(path, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong. Try again.");
  return data as T;
}

export type Status = "solid" | "solid*" | "shaky" | "gap" | "unknown";

export interface Choice { i: number; text: string }
export type PublicItem = {
  id: string; title: string; level: string; minutes: number; topics: string[]; lc?: { num: number; slug: string };
} & (
  | { kind: "code"; prompt: string; fn: string; starter: string; tests: Test[]; compare: Compare }
  | { kind: "approach"; prompt: string; structures: Choice[]; complexities: Choice[] }
  | { kind: "mcq"; prompt: string; code?: string; options: Choice[] }
  | { kind: "bug"; fn: string; code: string; tests: Test[]; compare: Compare }
  | { kind: "explain"; prompt: string }
);

export interface SessionView {
  sessionId: number; kind: "fix" | "daily" | "weekly" | "mock"; index: number; total: number; item: PublicItem | null; topic: string | null;
  why?: string; practice?: { num: number; slug: string; title: string } | null; practiceInApp?: boolean;
}

export interface AnswerResult {
  score: number | null; note: string; done: boolean; next: SessionView | null;
  moved: { topic: string; from: Status; to: Status }[];
}

export interface Me {
  stage: "welcome" | "goal" | "finish-line" | "check" | "active";
  student?: { name: string; email: string; destination: string | null; company: string | null; testDate: string | null; hours: string | null; language: Language | null; nextSessionAt: string | null; outcome: string | null; link: string };
  openFixId?: number | null;
  destination?: { label: string; test: string; covers: string[]; readyRule: string } | null;
  position?: {
    skip: string[]; skipNames: string[]; skipPct: number; progress: number; requirementsMet: boolean; mockPassed: boolean; pendingReviews: number;
    gaps: { topic: string; name: string; evidence: string }[];
    unknownCore: string[];
    states: Record<string, { status: Status; name: string; tier: "core" | "common" | "advanced"; last: string | null }>;
    readyBy: { from: string; to: string; sessions: number; perWeek: number; verdict: "ready" | "on-track" | "tight" | "at-risk" };
  } | null;
  access?: { paid: "none" | "claimed" | "confirmed"; trialEnds: string | null; allowed: boolean };
  price?: number;
  upiId?: string | null;
  weeklyCount?: number;
}

export type Next =
  | { kind: "goal" | "fix" | "ready" }
  | { kind: "weekly"; itemIds: string[] }
  | { kind: "mock"; itemIds: string[] }
  | { kind: "check"; topic: string; topicName: string; itemId: string; why: string }
  | { kind: "practice"; topic: string; topicName: string; practiceTitle: string; why: string };
