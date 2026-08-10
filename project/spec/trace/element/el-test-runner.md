---
id: el-test-runner
type: "[[element]]"
statement: Answers one question about a change by running the narrowest test scope that settles it, and returns a structured verdict.
kind: existing
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.answer-with-tests
source_refs:
  - cand-thin-worktree
---

The scoped runner and the battery: a run carries its question, scope is
enforced, the verdict is structured, and a red is never carried.

Boundary: the interfaces the element matrix mints for its flows.

Realization: our runner over the platform's test machinery.
