import type { Compare } from "../content/items";

/** Normalise a value so equivalent answers compare equal (e.g. -0 and 0, any order for "sorted"). */
function normalise(v: unknown, mode: Compare): string {
  let x = JSON.parse(JSON.stringify(v ?? null));
  if (mode === "sorted" && Array.isArray(x)) {
    x = [...x].map((e) => JSON.stringify(e)).sort();
  }
  return JSON.stringify(x);
}

export function sameAnswer(got: unknown, expect: unknown, mode: Compare = "exact"): boolean {
  try {
    return normalise(got, mode) === normalise(expect, mode);
  } catch {
    return false;
  }
}
