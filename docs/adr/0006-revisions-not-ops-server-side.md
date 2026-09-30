# ADR 0006: Server stores revisions, not operations

- **Status:** Accepted (2026-10-01)

## Context
Monaco operations are lossless but voluminous and the most behaviourally
revealing data we have. Revisions (full code at natural pauses, checkpoints,
and structural jumps) are compact and are what the pipeline consumes.

## Decision
The extension compacts ops into revisions locally (using `@nue/analysis`).
Only revisions, executions, and context events are uploaded by default. Ops
stay in IndexedDB for 7 days after upload. Users may opt in to uploading ops
(server retention 30 days). V0's ablation study validates that revisions carry
the needed signal.

## Consequences
- Records remain regenerable from stored revisions indefinitely.
- Sub-pause detail (e.g., something typed and deleted within 2 s) is lost
  server-side unless the user opts in. We accept this, pending ablation results.
