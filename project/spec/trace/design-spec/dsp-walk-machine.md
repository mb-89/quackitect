---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: dsp-walk-machine
type: "[[design-spec]]"
statement: the pull-driven walk over compiled machines, carried by one session that recomputes position on every call
realizes:
  - "el-walk-engine"
  - "if-method-compiler-to-walk-engine"
  - "if-record-store-to-walk-engine"
files:
  - "project/deliverable/engine/session.ts"
  - "project/deliverable/engine/machine.ts"
  - "project/deliverable/engine/pull.ts"
  - "project/deliverable/engine/route.ts"
  - "project/deliverable/engine/atamwalk.ts"
  - "project/deliverable/engine/conditions.ts"
  - "project/deliverable/engine/scale.ts"
---

## Responsibility

One pull answers with one instruction: read, fill, choose, do or wait.
The session recomputes position from the repository on every call,
weighs each hop against the autonomy slider, serves the owed reading
with its proof, and never trusts a client-held position.

## Interface

The compiled machine arrives from the method compiler; the record's
instance and worktree arrive from the record store. The session is the
one consumer of both.

## Behavior and constraints

- Blocking is an instruction, never an error.
- A crash lands safe: the walk resumes from the repository.
- The pull answers inside a second on the driver's critical path.
