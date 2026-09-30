# Spike 001 — Can a page script observe the LeetCode editor?

- **Date:** 2026-10-01
- **Method:** Opened `https://leetcode.com/problems/two-sum/` (logged out) in a
  clean browser and ran JavaScript in the page's main world.
- **Status:** Partially confirmed. The editor-observation half is confirmed. The
  run/submit network half still needs a logged-in check (see "Still open").

## What we checked and what we found

| Question | Result |
|---|---|
| Is Monaco exposed as a page global? | **Yes.** `typeof window.monaco === "object"` |
| Can we enumerate editor models? | **Yes.** `monaco.editor.getModels()` returned 2 models: `inmemory://model/1` (language `cpp`, the solution editor) and `inmemory://model/2` (`plaintext`, empty). |
| Can we enumerate editor instances? | **Yes.** `monaco.editor.getEditors().length === 2` |
| Do model change events give us deltas? | **Yes.** `model.onDidChangeContent` fires with `{versionId, changes:[{range, rangeOffset, rangeLength, text}], isUndoing, isRedoing, isFlush}`. |
| Is undo distinguishable from a normal edit? | **Yes.** A programmatic `undo()` fired with `isUndoing: true`. This is a free, meaningful signal ("backed out a change"). |
| Where is the testcase input? | In a **separate CodeMirror 6 editor** (`.cm-editor`), not Monaco. Custom test inputs need a separate, optional observer. |
| Where do problem ID and slug come from? | `#__NEXT_DATA__` JSON contains `titleSlug`, `questionId`, `questionFrontendId`. The URL path also has the slug. |
| Are `fetch` / `XMLHttpRequest` native, so we can wrap them? | **Yes.** Both still report `[native code]`, so no framework wrapper is in the way. |
| Focus signal available? | `editor.onDidFocusEditorText` exists. |

## Implications

1. **We do not need keystrokes.** Monaco gives us *document operations*: the
   net effect of typing, pasting, undo and autocomplete, already normalized.
   That is strictly better than key events and far less invasive.
2. **We do not need the DOM for the code.** Monaco virtualizes rendered lines,
   so scraping `.view-lines` would miss off-screen code. The model API gives the
   full text at any version.
3. **The observer must run in the page's MAIN world.** `window.monaco` is a page
   global. An extension's default isolated-world content script cannot see it.
   MV3 supports `world: "MAIN"` content scripts, so the extension needs a small
   MAIN-world probe that talks to an isolated-world relay.
4. **`isFlush` marks resets** (language switch, "reset to default code", loading
   a saved submission). These must become session events, not "the user deleted
   everything".
5. **Model identity is not stable.** `inmemory://model/1` is an in-memory URI.
   We must pick the solution model by heuristics (the non-plaintext model
   attached to the largest editor) and handle model replacement on
   language switch.

## Still open (verify in the Phase 2 capture spike, logged in)

- Exact run and submit endpoints and payloads. From public knowledge they are
  `POST /problems/{slug}/interpret_solution/` and `POST /problems/{slug}/submit/`,
  followed by polling `GET /submissions/detail/{id}/check/`. The request body is
  expected to contain `typed_code` and `lang`, which would give us an exact code
  checkpoint at every run, independent of Monaco.
- The shape of check responses: status, compile/runtime error text, failing
  testcase, expected vs. actual output.
- Whether navigating to the Editorial / Solutions tabs is observable from the
  URL (it is a client-side route change, so we need `history` hooks or polling).
- Behaviour in the LeetCode "contest" and "study plan" pages.
- leetcode.cn differences (out of scope for V1).

## Probe code (for reproducibility)

```js
const m = monaco.editor.getModels()[0];
const evs = [];
const d = m.onDidChangeContent(e => evs.push({
  versionId: e.versionId, isUndoing: e.isUndoing, isRedoing: e.isRedoing, isFlush: e.isFlush,
  changes: e.changes.map(c => ({ rangeOffset: c.rangeOffset, rangeLength: c.rangeLength, text: c.text })),
}));
const ed = monaco.editor.getEditors().find(e => e.getModel() === m);
ed.executeEdits("probe", [{ range: new monaco.Range(1, 1, 1, 1), text: "// x\n" }]);
m.undo();
d.dispose();
evs;
```
