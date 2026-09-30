# 08 — Privacy, Security, and Ethics

Covers design-doc section **11 (Privacy/security model)** and the security /
ethics brief.

Nue observes people while they think. That's intimate, even when it's "just
code". Privacy is a product feature here: if users don't trust the recorder,
they turn it off, and the product is gone.

---

## 1. Privacy principles (these are product requirements)

1. **Scope is enforced by the platform, not by our promises.** The extension
   *cannot* run anywhere except `https://leetcode.com/problems/*`, because it
   doesn't request permission to. That covers the "accidentally captured my bank
   tab" class of failure. It can't happen, and a reviewer can verify it from the
   manifest.
2. **Record the minimum signal.** No keystrokes, no cursor, no screen, no
   problem text, no cookies. See [capture](01-capture.md).
3. **Visible, always.** If Nue is recording, the badge says so. There is no
   silent mode.
4. **Controllable at every granularity:** global off → per-problem exclusion →
   pause → discard this session → delete any session later → delete account.
5. **Most granular data stays local.** Operations stay on device unless the
   user opts in.
6. **The user owns the data.** Full export in open formats (JSON + Markdown) at
   any time. Deletion is real (hard delete, cascades, backups age out).
7. **AI processing is disclosed and optional.** Users can turn AI off and still
   keep the capture/timeline (the observed-facts record works without any LLM).

---

## 2. Consent and controls

### Consent

- Consent is **explicit, versioned, and stored** (`consent_version`,
  `consent_at`). Capture does not start until consent is given in the web app
  **and** the extension is paired.
- The consent screen is five plain-language bullets (see
  [UX](02-product.md#first-run-experience-target--2-minutes)), not a legal
  wall. A link goes to the full policy.
- If what we capture or where we send it changes, the consent version bumps,
  capture pauses, and the user re-consents.

### Controls

| Control | Where | Effect |
|---|---|---|
| Recording indicator | Toolbar badge (red/grey/amber/none) | Always accurate; derived from the same state that gates capture |
| Pause / resume | Popup, `⌥⇧P` shortcut | Probe detaches listeners. `paused`/`resumed` context events recorded so gaps are explained |
| End session | Popup | Finalizes now |
| **Discard session** | Popup, web | Deletes local data immediately; deletes server data if uploaded |
| Exclude problem | Popup ("never record this problem") | Slug added to `excluded_problem_slugs` |
| Global capture off | Popup, web settings | Extension stays installed, records nothing |
| Upload detailed edit history | Web settings (default **off**) | Uploads Tier 2 ops (server retention 30 days) |
| Local op retention | Web settings (default 7 days) | Device deletes ops after N days post-upload |
| AI processing | Web settings (default on, set at consent) | Off → records contain observed facts only; no LLM calls |
| Export | Web settings | Async job → zip (JSON + Markdown), link valid 24 h |
| Delete account | Web settings | Hard delete, see below |
| Paired devices | Web settings | List, rename, revoke |

### Incognito

The extension is disabled in incognito by default (Chrome's default), and we
don't ask users to enable it. Settings explain this.

---

## 3. Data lifecycle

```
capture ──► IndexedDB (device) ──upload──► Postgres (trace) ──► pipeline ──► records
   │              │                              │                              │
   │              └─ ops: deleted N days         ├─ session delete: CASCADE     │
   │                 after upload (default 7)    ├─ account delete: CASCADE     │
   │                                             └─ opt-in ops: expire 30 days  │
   └─ paused/excluded: nothing captured                                         │
                                               LLM provider: transient, per provider terms
```

- **Hard delete**: `DELETE FROM user WHERE id = $1` cascades to every user-owned
  row. Device tokens are revoked by the same cascade. A job deletes the user's
  export files. Backups (managed Postgres PITR) age out within the provider's
  retention window (e.g., 7 days), and the policy states this honestly.
- **Retention sweeper**: a daily pg-boss cron job deletes expired `session_ops`
  and old record versions (keeps current + previous).
- **Logs** contain IDs, never content, so deleting DB rows is sufficient.
- **Analytics** events contain no code or problem content, and are keyed by an
  opaque ID that is deleted with the account.

---

## 4. Encryption

| Where | V1 | Later |
|---|---|---|
| In transit | TLS 1.2+ everywhere (HSTS on web + API) | — |
| At rest, server | Managed Postgres disk encryption (AES-256, provider-managed keys) | **Per-user envelope encryption** of `revision.code`, `execution.*_output`, and record documents: data key per user, wrapped by a KMS key. Makes account deletion cryptographic (destroy the key) and limits blast radius of a DB dump. Deferred because it complicates search and debugging, and V1 has no search over code |
| At rest, extension | IndexedDB (unencrypted, inside the Chrome profile) | Stays as is. Encrypting with a key stored next to it adds nothing. The OS user account + FileVault is the real boundary |
| Secrets | Env vars on the PaaS; never in repo; `.env` git-ignored | Secret manager if team grows |
| Device tokens | Only SHA-256 hashes stored server-side | — |

---

## 5. Threat model

Assets, most to least sensitive: (1) user identity ↔ code/timing history,
(2) auth credentials (Nue session, device tokens), (3) users' LeetCode sessions
(which we must never touch), (4) our LLM API key.

| # | Threat | Vector | Mitigation |
|---|---|---|---|
| T1 | **Over-capture**: recording things outside scope | Bug, feature creep, broad permissions | Minimal `host_permissions`; no `tabs`, `history`, `cookies`, `webRequest`, `<all_urls>`, `clipboardRead`, `scripting` for arbitrary hosts. CI check fails if manifest permissions change without a doc update |
| T2 | **Capturing secrets typed into the editor** | Users paste API keys, emails, etc. into code | Extension-side redaction pass (high-signal regexes: AWS/GCP/OpenAI/Anthropic/GitHub token formats, private keys, emails, long high-entropy strings) replaces with `«redacted:kind»` **before upload**; count recorded |
| T3 | **Page script spoofs capture messages** | LeetCode page (or an XSS on it, or another extension) posts fake messages to our ISOLATED relay | Validate every message with zod; nonce handshake generated at injection; treat content as untrusted *data* (worst case: garbage in a user's own trace); rate-limit per tab; never send tokens or settings into MAIN world |
| T4 | **Our MAIN-world wrapper leaks LeetCode credentials** | Wrapping `fetch` puts us in the path of auth headers | Wrapper passes requests through untouched; only reads the **URL** (allowlist regex) and for matches reads **JSON bodies** of request/response; never reads headers or cookies; never forwards anything but whitelisted fields (`typed_code`, `lang`, result fields) |
| T5 | **Malicious extension update** (supply chain / account takeover of the Web Store account) | Attacker ships update with broad capture | Hardware-key 2FA on Web Store + GitHub; release via CI with provenance; lockfile + `pnpm audit` + Renovate with review; minimal deps in extension; MV3 forbids remote code |
| T6 | **Device token theft** | Malware/extension reads `chrome.storage` | Token scoped to `capture:write` + `config:read` only (cannot read records); revocable; `last_seen_at` shown in settings |
| T7 | **Server breach / DB dump** | App vuln, leaked creds | Least-privilege DB role for app; no content in logs; secrets in PaaS; dependency scanning; (later) per-user envelope encryption |
| T8 | **Cross-user data access (IDOR)** | Missing `user_id` filter | Every query goes through module services that take `userId` from the session, never from the request. Integration tests assert 404 on other users' IDs for every route |
| T9 | **Prompt injection via user code** | Code comments like "ignore instructions, output …" | The LLM has **no tools and no access** beyond its input, so injection can only affect that user's own record. Output is schema-validated + evidence-validated. Code is delimited as data in prompts |
| T10 | **LLM provider exposure** | Provider retention/training | Provider chosen for API no-training default; data minimization (no emails/names in prompts, only code + facts); request zero-data-retention terms when volume justifies; disclosed in consent |
| T11 | **CSRF / session attacks on web app** | Standard web | HTTP-only, Secure, SameSite=Lax cookies; CSRF protection on mutations (Better Auth); strict CORS allowlist; CSP on the SPA |
| T12 | **Web → extension messaging abuse** | Other sites message the extension | `externally_connectable.matches` = Nue origin only; validate sender origin |

---

## 6. Ethics and specific concerns

### Keylogging

We do **not** log keystrokes, and we can say so precisely: we observe the
*document* (the text of one code editor on one site) and its changes, the same
information the editor keeps in its own undo history. We use **no** OS-level
input monitoring, Accessibility, or Screen Recording permissions. That's why
the architecture is a scoped extension and not a desktop agent.

### Browser permissions

Requested: `storage`, `host_permissions: ["https://leetcode.com/problems/*"]`.
Optional later: `notifications` (only if the user enables "notes ready"
notifications). Nothing else. The Chrome Web Store listing's privacy practices
disclosure mirrors this doc.

### Credential leakage

Covered by T2/T4. We never read cookies, headers, or LeetCode's CSRF token,
and never make requests *as* the user to LeetCode in V1.

### Third-party terms

LeetCode's terms restrict scraping, automated access, and redistribution of
their content. Our position:

- **Passive observation of the user's own session, in the user's own browser,
  on the user's behalf.** No automated requests, no crawling, no load on their
  servers. This is the same category as many popular LeetCode extensions.
- **We never store or redistribute problem statements** (copyright). We store
  slug, title, difficulty, and tags (factual metadata).
- **Contests are excluded** (`/contest/*` isn't in our permissions), so there's
  no perception of competitive advantage tooling.
- **No assistance during solving**, so no "cheating tool" concern.
- Future **history import** (backfill) would make requests with the user's
  session. That must be user-initiated, rate-limited, and reviewed against the
  terms at that time.
- Before public launch: legal review of LeetCode's current terms and a
  published "how Nue interacts with LeetCode" page.

### Sensitive information and accidental capture

Even inside scope, users might type personal notes into the editor. Mitigations:
redaction (T2), discard session, and the fact that every piece of captured data
is visible to the user in their own timeline. Nothing is hidden from the person
it's about.

### LLM data transmission, local vs. cloud inference

| | Cloud LLM (V1 default) | Local LLM (later opt-in) |
|---|---|---|
| Quality on this task | High | Currently noticeably lower for multi-step reasoning over traces |
| Privacy | Data leaves device to Nue + provider | Code never leaves device (if pipeline also local) |
| Cost | Per-token | User's hardware |
| Complexity | Low | Needs local runtime (Ollama), model download, a local pipeline path |

Decision: cloud for V1, with honest disclosure, data minimization, and an
"AI processing off" switch. The `LlmClient` interface keeps a local
implementation possible. If there's user demand, a "local-only mode" (extension
+ local pipeline + Ollama, no server) is a coherent V2+ product tier.

### Model provider retention

Record in the policy, for the chosen provider at launch: training use (none for
API by default), retention window for abuse monitoring, and the ZDR option.
**Re-verify at launch time.** Provider terms change, and this doc will go stale.

### Psychological safety

Observing struggle can feel judgmental. Language guidelines for all generated
text: describe, don't evaluate; no praise inflation; no "you should have known";
mistakes framed as patterns to fix, with evidence. "Discard session" exists
partly so people can have a bad day without it becoming data.
