---
minted_in: i1
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
  - req-a-deletion-names-what-points-at-the-node
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

## The deletion warning lands here, on serve-a-step (i11, 2026-08-16)

req-a-deletion-names-what-points-at-the-node DEMANDS A WARNING AT THE DELETE,
and the delete is a lane call served by this element.

IT WAS FIRST ALLOCATED TO work-the-register AND THAT WAS WRONG, twice over.
That function's only implementer is el-mirror, which renders the register and
never sees the act. And the demand is not about the RAID register at all — it
is about any trace node.

ADDING work-the-register HERE WAS THE SECOND MISTAKE, and the engine caught it
mechanically: it owed two new interfaces, el-account and el-holding-pen both
crossing into this element. Minting an interface IS the architecture moving,
which would have escalated the iteration to major for the sake of a warning
message.

SO IT SITS ON serve-a-step, which this element already implements. A delete is
something the actor does; naming what it breaks is what the product does back,
before the act lands. That is serve-a-step's sentence, and no interface is
owed because no new crossing appears.
