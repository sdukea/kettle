# ADR 0005: No desktop app (for now)

- **Status:** Accepted (2026-10-01)

## Context
A desktop component (Tauri/Electron/native) was considered for capture, local
processing, and presence.

## Decision
No desktop app in V0–V1.5. Capture lives in the browser extension, review in
the web app, processing on the server.

## Consequences
- No notarization, no Rust/Electron toolchain, no OS-level permissions.
- If capture must extend to local IDEs, build a VS Code extension (same
  document-change API shape) before considering a desktop agent.
- A fully local mode (local LLM) would reopen this decision.
