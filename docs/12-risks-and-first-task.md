# 12 — Risks, Non-Goals, and the First Task

Covers design-doc sections **19 (Biggest technical risks)**, **20 (Biggest
product risks)**, **21 (What NOT to build)** and **22 (Exact first
implementation task)**.

---

## 1. Biggest technical risks

| # | Risk | Likelihood | Impact | Mitigation | Early warning |
|---|---|---|---|---|---|
| R1 | **LeetCode changes break capture** (stops exposing `window.monaco`, renames endpoints, changes payloads) | High over a year | High | Three independent signals (Monaco, network, DOM result panel); all platform knowledge in one adapter; contract fixtures; health telemetry (hook success rate); degrade to Tier 0 rather than fail | Health metric drops; amber badges |
| R2 | **Inference quality is mediocre**: claims feel generic or wrong | Medium | **Critical** (it's the thesis) | Facts computed, not generated; evidence-validated claims; confidence + alternatives; golden set + evals; correct-the-record as ground truth; V0 gate before any server work | V0 criterion 3; rejection rate |
| R3 | **Segmentation is wrong** (merges distinct approaches or splits one) | Medium | Medium-high: garbage journey | Labeled golden set; boundary reasons exposed in debug view; LLM may flag (not silently change) boundaries | Boundary precision/recall on golden set |
| R4 | **Mid-solve code doesn't parse**, so features are empty | High | Medium | tree-sitter error recovery; features computed on best-effort partial trees; fall back to token-level heuristics; only require parseable code at checkpoints | % revisions with `parses=false` |
| R5 | **MV3 service-worker lifecycle loses data** | Medium | Medium | Append-to-IndexedDB on every event; stateless SW; session state reconstructed from IDB on wake | Gaps in `seq` |
| R6 | **LLM cost per session too high** at scale | Medium | Medium | Compact trace text; code only at boundaries; prompt caching; small model for classification; per-problem profile caching | `cost_usd` per run |
| R7 | **Latency**: records take minutes | Low | Low-medium | Records aren't needed instantly; target p50 ≤ 60 s | Pipeline duration p50/p95 |
| R8 | **Multi-language support** multiplies analysis work | High | Medium | Python first; feature detectors via per-language query files behind one interface; LLM stages language-agnostic | Language mix in beta |
| R9 | **Chrome Web Store review** friction (MAIN-world script wrapping `fetch` looks suspicious) | Medium | Medium | Minimal permissions; clear single-purpose description; privacy disclosures accurate; readable (non-obfuscated) code | Review rejection |

## 2. Biggest product risks

| # | Risk | Mitigation |
|---|---|---|
| P1 | **"Nice once, never opened again."** Records are interesting but don't change behaviour | The outer loop (review, mistakes) is where retention lives. V1 measures open rate; V1.5 must show re-solve improvement. If records aren't opened, the "needs your eyes" hook and short layers are the levers |
| P2 | **Users don't want to be observed** / the creepiness factor | Platform-enforced scope, visible badge, discard, local ops, honest copy. Measure install→consent drop-off |
| P3 | **Users solve with help** (editorial, ChatGPT in another tab, pasted code), so the journey reflects the tool, not the person | Record assistance honestly; "assisted" concepts; journeys still show what they *tried*. We can't see ChatGPT in another tab, and we won't try. Pasted-code detection is the honest proxy |
| P4 | **The value needs volume**: mistake profile and patterns need ~30+ sessions | The single-record value must stand alone (V0 gate). Optional history import (V2) to seed the library |
| P5 | **LeetCode builds this** (they have the data) | They optimize for their editorial/premium. A personal, cross-platform, privacy-respecting learning record is a different product. Keep the adapter layer so Nue isn't LeetCode-only |
| P6 | **Market is seasonal and churny** (people stop after getting a job) | Accept it: price for the prep window. Also a real long-term audience (continuous learners, bootcamps) |
| P7 | **Over-building before validation** | This document's phase gates. The V0 gate is real |

## 3. What NOT to build

Deliberately out, with the reason, so the temptation can be checked against
something written:

- ❌ **Any in-editor help while solving** (hints, autocomplete, "you seem
  stuck"). It violates the core principle and poisons the signal.
- ❌ **A desktop app, Accessibility, screen recording, or keystroke capture.**
  See [capture](01-capture.md).
- ❌ **A chat interface** in V1. Structured artifacts only.
- ❌ **A readiness score.** Evidence and trends instead.
- ❌ **Microservices**, Kubernetes, Terraform, event buses, Redis. One app, two
  processes, one Postgres.
- ❌ **A vector database** (or pgvector) before a real retrieval problem exists.
- ❌ **LangChain/agent frameworks.** A 100-line `LlmClient` and pure stage
  functions.
- ❌ **Storing problem statements.** Copyright, and we don't need them.
- ❌ **Re-hosting problems / our own judge.** LeetCode is the environment.
- ❌ **Social features, leaderboards, streaks.**
- ❌ **Mobile app.** The web app is responsive, and reviewing on a phone works in
  the browser.
- ❌ **Safari/Firefox, Notion sync, interview mode, pattern graph** before V1.5
  shows retention.
- ❌ **Custom auth.**
- ❌ **Generic "AI insights"** without cross-session evidence thresholds.
- ❌ **Contest support.**

---

## 4. Exact first implementation task

**Phase 0 is complete in this repo** (tooling baseline). The first real task is
**Phase 1: the logged-in capture spike**, because every later design choice
leans on the answer, and it takes 1–2 days.

### Task: `spike/capture`, prove Tier 0 + Tier 1 on real LeetCode

**Branch:** `spike/capture` (not merged; findings are).

**Create** a throwaway unpacked extension in `spikes/capture/`:

```
spikes/capture/
  manifest.json      # MV3; host_permissions: ["https://leetcode.com/problems/*"]
                     # content_scripts: [{ matches: [...], js: ["probe.js"], world: "MAIN", run_at: "document_start" },
                     #                   { matches: [...], js: ["relay.js"] }]
                     # background: { service_worker: "bg.js" }
  probe.js           # MAIN world
  relay.js           # ISOLATED world: window 'message' → chrome.runtime.sendMessage
  bg.js              # appends every message to an in-memory array + chrome.storage.local; "dump" on action click
```

`probe.js` must:
1. **Wrap `fetch` and `XMLHttpRequest` at `document_start`** (before LeetCode's
   code runs). For URLs matching
   `/\/problems\/[^/]+\/(interpret_solution|submit)\/|\/submissions\/detail\/[^/]+\/check\/|\/graphql/`
   clone the request body and response and post them (for `/graphql`, only the
   `operationName` to learn which queries exist).
2. **Poll for `window.monaco`** (every 250 ms, up to 30 s). Then attach
   `onDidChangeContent` to the solution model (non-plaintext model with the
   largest editor), plus `monaco.editor.onDidCreateModel` to catch model
   replacement on language switch. Post each op with `performance.now()`.
3. **Hook `history.pushState`/`replaceState` + `popstate`** and post URL
   changes (Description/Editorial/Solutions/Submissions tab switches).
4. Post `visibilitychange` and editor focus/blur.

**Then do this script by hand** and dump the log after each:
1. Two Sum, Python: type brute force, delete it, write hashmap, **Run** →
   **Submit** (accepted).
2. Same problem: introduce a syntax error → Run (compile error). Introduce an
   IndexError → Run (runtime error).
3. A problem where brute force TLEs (e.g., "Longest Substring Without Repeating
   Characters" O(n³)) → Submit (TLE), and a wrong answer.
4. Run with **custom testcase** input.
5. Switch language Python → Java; **Reset** to default code.
6. Open **Editorial** and **Solutions** tabs; open **Hints**.
7. Leave the tab for 2 min, come back.

**Write** `docs/spikes/002-run-submit-network.md` answering:
- Exact request fields carrying code, language, question id, custom input.
- `check` polling: pending states vs. terminal states; fields for verdict,
  compile/runtime error text, error line, failing input, expected/actual output,
  passed/total, runtime/memory.
- Whether Run and Submit results differ in shape.
- Whether Monaco models are replaced on language switch (and whether our
  `onDidCreateModel` hook caught it).
- Route patterns for Editorial/Solutions/Hints (or whether hints are in-page
  toggles needing a DOM signal).
- Any case where `window.monaco` wasn't available, and when it became available.

**Commit** 5–10 **scrubbed** payload samples (remove cookies, CSRF, user IDs,
usernames) to `fixtures/leetcode/network/`. These become the adapter's
contract-test fixtures in Phase 4.

**Done when:** the spike doc is merged and every "Still open" item from
Spike 001 has an answer or a named fallback.

**Next after that:** Phase 2 (contracts). Start by encoding exactly what the
spike found into `packages/contracts/src/capture.ts`.
