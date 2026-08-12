---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: el-walk-engine
type: "[[element]]"
statement: Serves every step of a governed walk — computes the position, hands out instructions and readings, and judges every claim against its form.
kind: existing
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk
  - fn-run-a-governed-walk.serve-a-step
  - fn-run-a-governed-walk.judge-a-claim
  - fn-run-a-governed-walk.help-find-a-capability
source_refs:
  - cand-thin-worktree
  - raid-dec-two-layer-auth
---

The engine core: the pull loop, the state machine walker, the form builder
and the claim checker. It consumes the compiled machine and the walk's
position; it emits instructions, evidence forms, stamped claims and typed
refusals.

Boundary: the interfaces the element matrix mints for its flows. The
two-layer authorisation ([[raid-dec-two-layer-auth]]) is judged here, at the
dispatch seam.

Realization: the standing engine (session, stateform, pull) — grown, never
rewritten.
