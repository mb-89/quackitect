---
minted_in: i1
id: fn-run-a-governed-walk.judge-a-claim
type: "[[function]]"
cluster: the-walk
statement: build the form a step owes, check what comes back, and carry a person's verdict on it
satisfies:
  - req-a-harmless-finding-is-carried-not-stopped-on
  - req-a-harmless-finding-names-an-open-entry
  - req-form-is-built-and-checked
  - req-coverage-checked-both-ways
  - req-a-coverage-check-computes-both-sides
  - req-gate-needs-a-persons-verdict
  - req-gate-evidence-must-be-sound
  - req-gate-shows-the-evidence-form
  - req-gate-rounds-stay-readable
  - req-rejection-carries-its-reason
  - req-reject-names-the-redo
  - req-moved-evidence-invalidates-the-bless
  - req-bless-outputs-ride-the-bless
  - req-bound-field-rebuilds-from-nodes
  - req-structure-verdicts-are-mechanical
  - req-a-ripple-names-its-root
inputs:
  - flow-compiled-machine
  - flow-filled-claim
outputs:
  - flow-evidence-form
  - flow-stamped-claim
  - flow-refusal
controls:
  - the shape checks each field's template declares
  - the rule that a moved input suspects the bless above it
source_refs:
  - uc-adjudicate-a-gate
  - uc-take-a-step
---

## Rationale

THE MACHINE CHECKS SHAPE. THE PERSON JUDGES CONTENT. Both halves live here
because they act on one artifact, and separating them would let a form pass
its checks in one place and be rejected in another with no shared record of
which claim was being judged.

The suspect ripple sits here too. A bless is a judgment ON evidence, so when
that evidence moves, the thing that has to notice is whatever holds the
judgment.

It names no surface. A gate is presented, not drawn, and how it is drawn is
the showing function's.
