# 01 — The Critical Question: Capture

> How can we reliably observe and reconstruct a user's LeetCode solving
> process without invasive full-device keylogging?

This is the decision everything else depends on, so it comes first. It covers
design-doc sections **6 (Technical feasibility)** and **7 (Capture architecture
comparison)**, and sets up section 8.

---

## 1. Start from the output, not the input

Don't ask "what can we record?". Ask "what does the reasoning reconstruction
actually need?". Go through the questions the product promises to answer and
list the smallest signal that answers each one:

| Question we promise to answer | Minimum signal that answers it |
|---|---|
| What approach did I try first? | The code as it stood at the first meaningful pause, before any run |
| What did I try that I never ran? | Code states between runs, **including code that was later deleted** |
| Where did I get stuck? | Timestamps + little net change + repeated small edits + runs that failed the same way |
| What went wrong? | Run/submit results: compile error, runtime error, wrong answer (input, expected, actual), TLE/MLE |
| What caused the approach change? | The run result just before a large structural rewrite, plus the elapsed time |
| What fixed the bug? | The diff between a failing run's code and the next passing run's code |
| Did I look at hints or the editorial? | Navigation to Hints / Editorial / Solutions tabs **on the same problem page** |
| Did I paste code in? | A single insertion of many lines in one operation |
| How long until the key insight? | Timestamp of the first revision containing the final approach's structural fingerprint, minus session start, minus idle time |
| Which concepts did I demonstrate? | Final code (structure) + problem metadata |
| What's my repeated mistake? | The same error/fix categories across many sessions |

Things **not** in the right-hand column:

- individual keystrokes or key timing
- cursor position or selection
- mouse movement
- screen pixels
- anything outside the LeetCode problem page
- the problem statement text (we need the problem's *identity*, not a copy of
  its copyrighted text)

### The minimum viable signal

Three tiers, ordered by value per unit of intrusiveness:

**Tier 0 — Checkpoints (required).**
Problem identity + language + the exact code at every Run/Submit + the result
of that run + timestamps. On its own this gives the sequence of *tested*
attempts and how each one failed. It is the most reliable tier because it comes
from the run request itself.

**Tier 1 — Revisions (required for the product thesis).**
Snapshots of the full code taken at *natural pauses* (≥ ~2 s without edits),
plus on large structural changes, plus on focus loss. This is what captures
**abandoned approaches that were never run**: the deleted
`for i in range(len(nums)):` from the vision doc. Without Tier 1 the product is
"notes from your submissions", which LeetCode's submission history already
roughly gives you.

**Tier 2 — Operations (captured, but short-lived).**
Monaco's `onDidChangeContent` deltas (offset, length, inserted text, undo/redo
flags). We capture these because they are the only lossless source: Tier 1 can
always be recomputed from Tier 2, not the other way round. Operations are
**compacted into revisions** and then **deleted** after a retention window.
They never leave the device unless the user opts in to "upload full edit
history" (V1 default: off, see [privacy](07-privacy-security.md)).

**Session context (small, required).**
Tab visibility and editor focus (to separate active time from idle time),
navigation to Hint / Editorial / Solutions / Submissions views on the same
problem, and language switches and resets (`isFlush`).

> **Hypothesis to test in V0:** Tier 0 + Tier 1 + session context carries at
> least ~90% of the reasoning value of full operation logs. We test it by
> ablation: generate notes from (a) Tier 0 only, (b) Tier 0+1, (c) Tier 0+1+2
> on the same 20 sessions and compare blind. If (b) ≈ (c), Tier 2 stays
> local-only forever.

---

## 2. Comparing capture approaches

Scored against what matters: **fidelity** (does it recover the signals above?),
**reliability** (does it break when LeetCode ships a UI change?),
**invasiveness** (what the permission lets us see, not just what we choose to
look at), **permission friction**, and **product viability**.

### 1. Browser extension observing the LeetCode page (container)

An MV3 extension with `host_permissions` restricted to
`https://leetcode.com/problems/*`. Content scripts run only on those pages.

- **Fidelity:** container only. Decides *where* observation happens. Fidelity
  depends on options 2/3/7 below.
- **Invasiveness:** very low. Chrome enforces the scope. We *cannot* see other
  tabs, other sites, or other apps. This scoping is enforced by the platform,
  not just promised by us.
- **Friction:** one install and one permission prompt that names leetcode.com.
- **Verdict:** ✅ **The right container.** The browser is where the solving
  happens, and its permission model already expresses "only this site".

### 2. DOM instrumentation (MutationObserver on editor DOM)

Watch the editor's rendered lines.

- **Fidelity:** poor. Monaco virtualizes: only visible lines exist in the DOM.
  Scroll-dependent, lossy, and it breaks with every class-name change.
- **Verdict:** ❌ Only as a fallback to *detect* that an editor exists, or to
  read the (non-Monaco) result panel if the network path fails.

### 3. Editor-state observation (Monaco model API)

A MAIN-world script reads `window.monaco.editor.getModels()`, subscribes to
`onDidChangeContent`, and can read `getValue()` at any time.

- **Fidelity:** excellent. Lossless operations + full text + undo/redo/flush
  flags. **Confirmed live in [Spike 001](spikes/001-leetcode-editor-probe.md).**
- **Reliability:** good. Monaco's public API is far more stable than LeetCode's
  DOM. The risk is LeetCode ceasing to expose `window.monaco` (mitigation:
  Tier 0 still works through the network path).
- **Invasiveness:** it only sees editor content on the problem page. It sees
  what you type *into the editor*, which is exactly the product and nothing
  more.
- **Verdict:** ✅ **Primary source for Tier 1/2.**

### 4. macOS Accessibility APIs (AXUIElement)

A native app with Accessibility permission reads UI element values from the
browser.

- **Fidelity:** medium to poor. Browsers expose web content through AX trees,
  but Monaco's text is a virtualized, hidden `textarea` + divs. The AX value is
  often only the visible fragment or the current line.
- **Invasiveness:** 🚩 very high. The Accessibility permission grants the
  ability to read and *control every app on the Mac*. System Settings describes
  it that way, and users rightly balk at it.
- **Friction:** a native app, notarization, a scary permission flow, and
  per-browser quirks.
- **Verdict:** ❌ Worse data at far higher trust cost.

### 5. Screen recording + OCR

Periodic screenshots, OCR the editor.

- **Fidelity:** poor. OCR on code is error-prone (indentation, `l`/`1`, `O`/`0`),
  only visible regions, and diffing noisy text is hard.
- **Invasiveness:** 🚩 maximal. Screen Recording permission captures
  notifications, messages, passwords on screen, and other windows. It is also
  heavy on CPU and storage.
- **Verdict:** ❌ Rejected. The only thing it adds is "what else was on screen",
  which is exactly what we must *not* capture.

### 6. Keyboard event capture

Either a global keylogger (CGEventTap / Input Monitoring permission) or
page-level `keydown` listeners.

- **Fidelity:** *worse* than Monaco operations. Key events don't tell you what
  autocomplete inserted, what a paste contained, what undo reverted, or what
  multi-cursor edits did. You'd have to re-implement the editor to replay them.
- **Invasiveness:** global = 🚩 textbook keylogger (passwords, messages); it
  would rightly get flagged. Page-level = unnecessary given option 3.
- **Verdict:** ❌ **We never capture key events.** This is also a product
  promise: "Nue does not log keystrokes" is a sentence we want to be able to
  say truthfully and simply.

### 7. Periodic code snapshots (polling `getValue()`)

Every N seconds, read the full code.

- **Fidelity:** ok. It misses anything typed and deleted within one interval,
  and a fixed interval produces lots of duplicates while idle.
- **Reliability:** high, and the simplest mechanism.
- **Verdict:** ⚠️ **As a safety net, not the primary mechanism.** Event-driven
  revisions (at pauses) are strictly better, and a slow poll (every 30 s while
  focused) catches the case where event subscription silently broke.

### 8. Network observation of Run/Submit

The MAIN-world script wraps `fetch`/`XMLHttpRequest` and inspects **only**
requests to LeetCode's run/submit/check endpoints.

- **Fidelity:** exact code at each checkpoint + authoritative results (verdict,
  error message, failing input, expected/actual output, runtime).
- **Reliability:** good. Endpoints change less often than DOM. Contract-tested
  against recorded fixtures.
- **Invasiveness:** we allowlist URL patterns and read only those bodies. We
  never read cookies, auth headers, or the CSRF token. The wrapper forwards
  everything else untouched and unread.
- **Verdict:** ✅ **Primary source for Tier 0** (to be confirmed logged-in in
  the Phase 2 spike).

### 9. (Other) Official APIs / post-hoc import

Pulling the user's submission history from LeetCode after the fact (GraphQL,
with the user's session).

- **Fidelity:** Tier 0 only, and only submits, not runs. No abandoned code.
- **Verdict:** ⚠️ A useful **backfill** later ("import your last 100 accepted
  solutions to seed your pattern library"). It isn't the capture mechanism, and
  it raises ToS questions to be handled carefully (see [privacy](07-privacy-security.md#third-party-terms)).

### Summary matrix

| Approach | Fidelity | Reliability | Invasiveness | Friction | Use |
|---|---|---|---|---|---|
| Extension (container) | — | high | **low, platform-enforced** | low | ✅ container |
| DOM MutationObserver | low | low | low | — | fallback only |
| **Monaco model API** | **very high** | med-high | low | — | ✅ Tier 1/2 |
| macOS Accessibility | low-med | low | 🚩 very high | high | ❌ |
| Screen recording + OCR | low | low | 🚩 maximal | high | ❌ |
| Keyboard events | medium | med | 🚩 high | med-high | ❌ never |
| Periodic snapshots | medium | high | low | — | safety net |
| **Run/submit network** | **exact** at checkpoints | med-high | low (allowlisted) | — | ✅ Tier 0 |
| Post-hoc import | low | med | low | — | later backfill |

### Decision: hybrid, all inside one scoped extension

```
Monaco operations ─┐
                   ├─► Revision builder (pause-coalesced) ─┐
Slow poll (30 s) ──┘                                       │
Run/Submit network intercept ──► Checkpoints + Results ────┼─► Session trace
Route + visibility + focus ────► Context events ───────────┘
```

Each source covers another's failure mode. If Monaco disappears, checkpoints
still work. If the network shape changes, revisions still work, and the result
panel DOM becomes the fallback. Session boundaries use all of them.

---

## 3. Feasibility analysis

### Platform facts that shape the design

- **MV3 content scripts** can be declared with `"world": "MAIN"` (Chrome 111+)
  to run in the page's JS context. That is required to reach `window.monaco`
  and wrap `fetch`. MAIN-world scripts have **no** extension API access, so a
  second, **isolated-world** content script relays messages to the service
  worker. The MAIN↔ISOLATED channel is `window.postMessage`, which the page can
  also see and spoof, so treat it as untrusted: validate every message with the
  shared zod schema, and never send anything sensitive *into* the MAIN world.
- **MV3 service workers are ephemeral.** They are killed after ~30 s idle. No
  in-memory state can be trusted, so everything is appended to **IndexedDB**
  immediately, and the service worker is effectively stateless.
- **No remote code in MV3.** All logic ships in the extension package. That's
  good for security review, and it means the capture logic is versioned with
  the extension, so events must carry `captureVersion`.
- **Host permissions** are shown to the user at install. We request only
  `https://leetcode.com/problems/*` (+ `/submissions/detail/*/check/` is fetched
  *by the page*, so we need no permission for it; we only observe it from
  inside the page).
- **Incognito**: extensions are off in incognito unless the user enables them.
  We keep it that way and say so in settings.
- **Safari**: Safari Web Extensions support MV3 and content scripts, but ship
  inside a macOS app bundle built with Xcode and distributed through the App
  Store. Feasible later with the same TypeScript core. Not V1.
- **Firefox**: MAIN world supported (`world: "MAIN"` since FF 128). Cheap to add
  later.

### What a desktop app would add, honestly

Nothing for LeetCode-in-browser. A desktop component would matter only for:

1. solving in a **local IDE**, which is better served by a **VS Code
   extension** (VS Code has a first-class document-change API, the same shape
   as Monaco's), or
2. a **menu-bar presence**, which the extension's toolbar badge already covers.

So the decision is **no desktop app in V0–V1.5**. See [architecture](03-architecture.md#why-not-a-desktop-app).

### Session boundaries (deterministic)

A *session* is one sitting on one problem. It starts at the first edit on
a problem page (not at page load: browsing a problem isn't solving it). It ends
at whichever comes first:

- an **Accepted** submission followed by 10 min without edits,
- 30 min of no edits and no editor focus,
- navigation to a different problem,
- the user pressing **End session** / **Discard session**.

Coming back to the same problem later starts a **new session**, linked to the
same `problem`. Sessions ending without Accepted are still valuable. They're
"unsolved" records, and they're often the most instructive.

### Revision coalescing rules (deterministic)

Emit a revision when, since the last revision, there has been ≥ 1 operation
**and** one of these happens:

1. **Pause**: 2 s with no operation (tunable; the ablation measures this).
2. **Structural jump**: a single operation deletes ≥ 3 lines or inserts ≥ 5
   lines (captures "select-all, delete" and "paste").
3. **Checkpoint**: Run/Submit fired (the checkpoint *is* a revision, with
   `source=checkpoint`).
4. **Blur**: the editor loses focus or the tab is hidden.
5. **Flush**: `isFlush` operation (language switch/reset). Emit before + after.

Expected volume: 20–150 revisions per session, each 0.5–5 KB of code. That's
trivial.

### Handling awkward cases

| Case | Handling |
|---|---|
| User pastes a full solution from elsewhere | Detected as `paste` (≥ 5 lines inserted in one op). Recorded **honestly** and surfaced as "pasted code" in the timeline. We don't accuse. We just don't count it as demonstrated. |
| Reset to default code / language switch | `isFlush` → `context.reset` / `context.language_changed` event |
| Loading an old submission into editor | `isFlush` with non-template content → `context.code_loaded` |
| Multiple tabs on the same problem | Per-tab `tabSessionId`. Merge by problem on the server, ordered by timestamps |
| LeetCode UI change breaks Monaco hook | Health check at page load. Degrade to Tier 0, badge turns amber, telemetry counter (no content) |
| Contest pages | Out of scope for V1. Contest pages are excluded by URL pattern (avoids any perception of contest tooling) |
| Premium problems | Same capture. We never store problem statements, so no content leaks |
