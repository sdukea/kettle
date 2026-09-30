# Nue Design Documentation

Start here. The documents are ordered so each builds on the previous one. The
capture question comes first because it constrains everything else.

| Doc | Contents |
|---|---|
| [01 — Capture](01-capture.md) | The critical question: minimum viable signal, comparison of 9 capture approaches, feasibility, session/revision rules |
| [02 — Product](02-product.md) | Thesis, core loop, key insights, feature evaluation, UX, surfaces |
| [03 — MVP](03-mvp.md) | V0 / V1 / V1.5 / V2: capabilities, requirements, exclusions, success criteria |
| [04 — Architecture](04-architecture.md) | Platform decision, system diagram, data flow, technology choices from first principles, API boundaries |
| [05 — AI pipeline](05-ai-pipeline.md) | Four-layer trust model, stages (deterministic vs. LLM), claim validation, evals, cost |
| [06 — Data model](06-data-model.md) | Storage tiers (keep vs. discard), schema, taxonomy |
| [07 — Learning record](07-learning-record.md) | Note schema with observed/inferred/reference provenance |
| [08 — Privacy & security](08-privacy-security.md) | Consent, controls, lifecycle, encryption, threat model, ethics |
| [09 — Integrations](09-integrations.md) | Markdown, Obsidian, Notion, Google Keep, Apple Notes, Anki: what's actually feasible |
| [10 — Repo & dev env](10-repository-and-dev-environment.md) | Repository layout and why, macOS setup, commands, git strategy |
| [11 — Build plan](11-build-plan.md) | Phases with files, interfaces, tests, done criteria; testing strategy |
| [12 — Risks & first task](12-risks-and-first-task.md) | Technical/product risks, what not to build, exact first task |
| [ADRs](adr/README.md) | Decisions that are expensive to reverse |
| [Spikes](spikes/) | Time-boxed investigations and their findings |

## Map to the original brief (sections 1–22)

| # | Section | Where |
|---|---|---|
| 1 | Product thesis | [02 §1](02-product.md#1-product-thesis) |
| 2 | Core user loop | [02 §2](02-product.md#2-core-user-loop) |
| 3 | Key product insights | [02 §3](02-product.md#3-key-product-insights) |
| 4 | Feature possibilities | [02 §4](02-product.md#4-feature-possibilities) |
| 5 | MVP definition | [03](03-mvp.md) |
| 6 | Technical feasibility analysis | [01 §3](01-capture.md#3-feasibility-analysis), [Spike 001](spikes/001-leetcode-editor-probe.md) |
| 7 | Capture architecture comparison | [01 §2](01-capture.md#2-comparing-capture-approaches) |
| 8 | Recommended architecture | [04 §1](04-architecture.md#1-platform-decision) |
| 9 | AI pipeline | [05](05-ai-pipeline.md) |
| 10 | Data model | [06](06-data-model.md) |
| 11 | Privacy/security model | [08](08-privacy-security.md) |
| 12 | System architecture diagram | [04 §2](04-architecture.md#2-system-diagram) |
| 13 | Repository structure | [10 §1](10-repository-and-dev-environment.md#1-repository-structure) |
| 14 | Technology choices | [04 §3](04-architecture.md#3-technology-choices-from-first-principles) |
| 15 | Development environment | [10 §2](10-repository-and-dev-environment.md#2-development-environment-macos) |
| 16 | API boundaries | [04 §4](04-architecture.md#4-api-boundaries) |
| 17 | Build phases | [11](11-build-plan.md) |
| 18 | Testing strategy | [11, Testing strategy](11-build-plan.md#testing-strategy) |
| 19 | Biggest technical risks | [12 §1](12-risks-and-first-task.md#1-biggest-technical-risks) |
| 20 | Biggest product risks | [12 §2](12-risks-and-first-task.md#2-biggest-product-risks) |
| 21 | What NOT to build | [12 §3](12-risks-and-first-task.md#3-what-not-to-build) |
| 22 | Exact first implementation task | [12 §4](12-risks-and-first-task.md#4-exact-first-implementation-task) |

Also covered: notes architecture → [07](07-learning-record.md); external
notes → [09](09-integrations.md); UX and product surfaces →
[02 §5](02-product.md#5-ux-design); security/ethics →
[08 §5–6](08-privacy-security.md#5-threat-model).
