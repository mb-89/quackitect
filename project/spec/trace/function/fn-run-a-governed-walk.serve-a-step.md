---
minted_in: i1
id: fn-run-a-governed-walk.serve-a-step
type: "[[function]]"
cluster: the-walk
statement: hand the driver one instruction carrying everything that step needs
satisfies:
  - req-a-clear-jump-is-one-call
  - req-answer-pages-never-overflows
  - req-container-offers-its-records
  - req-pull-answers-from-record
  - req-state-opens-only-when-earned
  - req-state-needs-all-its-inputs
  - req-owed-reading-is-served
  - req-reading-proof
  - req-compaction-reowes-the-reading
  - req-red-objective-serves-its-fill
  - req-a-placeholder-drawing-refuses-entry
  - req-the-answer-never-exceeds-its-bound
  - req-missing-document-stops-the-walk
  - req-autonomy-gates-every-hop
  - req-autonomy-is-categorical
  - req-walk-branches-at-waypoint
  - req-autonomy-change-applies-forward
  - req-controls-never-advance-walk
  - req-emergency-sits-above-full
  - req-drumroll-arms-deliberately
  - req-shutdown-fires-only-idle-or-end
  - req-lane-fixes-what-machines-fix
  - req-walk-opens-at-retro
  - req-instruction-names-its-source
  - req-fallen-condition-named
  - req-crash-lands-safe
  - req-refusal-carries-remedy
  - req-call-answers-in-one-second
inputs:
  - flow-position
  - flow-compiled-machine
outputs:
  - flow-instruction
  - flow-refusal
  - flow-dispatched-call
controls:
  - the entry and exit conditions of the state ahead
  - the reading proof
source_refs:
  - uc-take-a-step
  - uc-get-work-routed
  - uc-be-handed-the-method
---

## Rationale

This is the walk's only forward verb, so it stands alone.

Everything that decides WHETHER the next step opens lives here: the
conditions, the owed reading and its proof, and the weighing against the
slider. Splitting the decision from the serving would put the refusal in one
place and the reason for it in another.

The one-second answer sits here rather than under a quality umbrella because
it is a property of THIS function. Nothing else in the tree is on the
driver's critical path.
