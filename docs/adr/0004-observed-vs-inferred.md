# ADR 0004: Facts are computed; the LLM only produces evidence-cited claims

- **Status:** Accepted (2026-10-01)

## Context
LLMs produce fluent, plausible, sometimes false statements. A learning record
that misstates what the user did destroys trust and teaches the wrong lesson.

## Decision
- Everything computable (timings, attempts, runs, errors, diffs, fixes,
  time-to-insight) is computed by deterministic code and rendered by templates
  ("observed").
- The LLM produces only interpretations ("inferred claims"). Each claim has a
  type, confidence, optional alternatives, and evidence references (with
  optional verbatim quotes) into the trace.
- A deterministic validator drops claims whose evidence doesn't exist, whose
  quotes don't appear verbatim, or which contradict timestamps.
- The UI and Markdown export visibly distinguish observed (👁) and inferred (💭)
  content, and users can confirm/reject/edit claims. Feedback persists across
  regeneration.

## Consequences
- More pipeline structure than "summarize this session".
- Hallucinations about user behaviour are structurally constrained, measurable
  (rejection rate), and correctable.
- User feedback becomes labeled data for evals.
