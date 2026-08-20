---
minted_in: i1
id: fn-run-a-governed-walk.serve-a-step
type: "[[function]]"
cluster: the-walk
statement: hand the driver one instruction carrying everything that step needs
satisfies:
  - req-an-empty-live-source-names-itself
  - req-a-deletion-names-what-points-at-the-node
  - req-a-pull-carrying-no-choice-enters-no-iteration
  - req-a-clear-jump-is-one-call
  - req-a-wrong-act-never-passes-silently
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
  - req-entering-repairs-itself-or-names-the-remedy
  - req-instruction-names-its-source
  - req-fallen-condition-named
  - req-crash-lands-safe
  - req-a-fallback-fires-when-its-condition-fails
  - req-refusal-carries-remedy
  - req-call-answers-in-one-second
  - req-one-operation-reads-its-input-once
  - req-a-served-instruction-names-the-next-act
  - req-oversized-results-remain-recoverable-through-the-lane
inputs:
  - flow-position
  - flow-compiled-machine
  - flow-harness-profile
  - flow-test-check-result
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

SO DOES THE RULE ABOUT HOW IT READS ITS INPUT. Serving a step reads the
corpus, and it used to read it once per part rather than once per call. That
is the same critical path and the same argument: a bound on the answer means
nothing while the cost multiplies by how many times the work asks.
