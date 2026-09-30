# ADR 0001: Capture via a site-scoped browser extension

- **Status:** Accepted (2026-10-01)

## Context
We need the evolution of a user's code while solving on LeetCode, including
abandoned code, plus run/submit results. Candidates: DOM scraping, Monaco
model API, macOS Accessibility, screen recording/OCR, keystroke capture,
periodic snapshots, network observation. Full analysis in
[01-capture.md](../01-capture.md). [Spike 001](../spikes/001-leetcode-editor-probe.md)
confirmed `window.monaco` is exposed and emits operation-level deltas.

## Decision
A Manifest V3 extension with `host_permissions` limited to
`https://leetcode.com/problems/*`. A MAIN-world script observes Monaco model
changes and allowlisted run/submit/check network traffic, relaying through an
ISOLATED-world content script to the service worker. No key events, cursor,
screen, cookies, or headers are ever read.

## Consequences
- Scope is enforced by Chrome, so capture outside LeetCode is impossible.
- Highest-fidelity signal available (document operations, exact checkpoint code).
- Coupled to LeetCode's frontend. Mitigated by a single adapter module,
  contract fixtures, redundant signals, and health telemetry.
- Chrome first. Firefox is cheap later; Safari needs an Xcode wrapper.
