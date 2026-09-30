# 09 — External Notes Integrations

Covers design-doc brief section **12**.

**Principle:** Nue's database is the canonical source of truth. Integrations
are **one-way exports/syncs**. Nue never depends on, or reads back from, an
external notes app. Structured data (claims, feedback, review state) can't
round-trip through free-form notes anyway.

Every integration is built on **one** deterministic Markdown renderer
(`renderMarkdown(record)` in `@nue/contracts`). Each integration is then just a
transport.

---

## Feasibility

| Target | Official API? | Realistic mechanism | Effort | Verdict / phase |
|---|---|---|---|---|
| **Markdown export** | n/a | Per-record download, "Copy as Markdown", bulk zip | XS | ✅ **V1** |
| **Obsidian** | No cloud API; vault is a local folder | (a) Bulk zip → unzip into vault. (b) **"Sync to folder"** with the File System Access API (`showDirectoryPicker`, Chromium browsers): user picks their vault subfolder once, handle persisted in IndexedDB, Nue writes/overwrites `nue/<slug>.md`. Permission is re-confirmed by the browser per visit. (c) Community "Local REST API" plugin: works, but requires a third-party plugin, so not a default | S | ✅ (a) V1, (b) **V1.5** |
| **Notion** | ✅ Public API, OAuth "public integration" | OAuth → user picks a parent page/database → we create a page per record (Markdown → Notion blocks conversion; 100 blocks/request, ~3 req/s rate limit) and update on regeneration by stored page ID | M | ✅ **V2** (V1: "Copy as Markdown" pastes reasonably into Notion) |
| **Google Keep** | ⚠️ The Keep API exists but is for **Google Workspace enterprise** use (admin-managed, domain-wide delegation), not consumer accounts | None acceptable for consumers | — | ❌ Not feasible. Document why |
| **Apple Notes** | ❌ No web or cloud API | (a) **Web Share API** (`navigator.share({title, text})`) opens the macOS/iOS share sheet, where Notes is a target, where the browser supports it. (b) A published **Apple Shortcut** that fetches a record's Markdown via a personal export URL and creates a note. (c) AppleScript only from a native app | XS–S | ⚠️ (a) **V1.5** as "Share…" button; (b) maybe later; (c) no |
| **Anki** *(added)* | No official API; `.apkg` format is documented; AnkiConnect plugin exists | Export review cards as `.apkg` (or CSV import) | S | ✅ **V1.5**: many target users already live in Anki |
| **GitHub repo** *(added)* | ✅ | Commit records as Markdown to a user's repo (the "LeetHub" behaviour, but with journeys) | M | ⚠️ V2, if users ask |

### Export format contract

- **JSON export** (`nue-export-v1`): all sessions (trace + metrics), records,
  claims with feedback, review logs. Schema published in `@nue/contracts`.
  This is the "you own your data" guarantee: complete enough to rebuild.
- **Markdown**: one file per session, front-matter for Obsidian Dataview, 👁/💭
  markers preserved.

### Sync semantics (for folder/Notion syncs)

- Idempotent writes keyed by `session_id` (file name or stored Notion page ID).
- Regeneration overwrites. Local edits in the external app **are overwritten**,
  and the UI says so. We place a `<!-- nue:managed -->` marker and a note:
  "edit in Nue to keep changes".
- Deletion in Nue can optionally delete the external copy (off by default).
