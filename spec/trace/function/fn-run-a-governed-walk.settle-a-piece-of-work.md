---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: fn-run-a-governed-walk.settle-a-piece-of-work
type: "[[function]]"
cluster: the-work
statement: bring one work token to a terminal status, carrying the result it produced and, where it is not done, the reason it is not
satisfies:
  - req-a-close-that-is-not-done-carries-its-reason
  - req-settled-work-is-the-evidence-inside-a-record
  - req-a-drawn-value-declares-snapshot-or-live-reading
  - req-work-only-a-person-can-settle-says-so-on-its-face
inputs:
  - flow-offered-work
outputs:
  - flow-settled-work
controls:
  - the mark saying only a person can close this one
  - whether a drawn value was declared a snapshot or a live reading
source_refs:
  - uc-work-a-states-work-tokens-to-completion
  - uc-take-a-step
  - raid-risk-a-drawn-token-that-reads-a-live-source-never-settles
---

## Rationale

THE RESULT LANDS ON THE WORK TOKEN ITSELF, and that is the whole of why this
function exists rather than being folded into judging. There is no second act
of copying an answer into a form: inside a record the settled work token IS
the evidence.

FOUR WAYS OUT AND ONLY ONE IS TRIVIAL TO WRITE. Done carries the evidence and
nothing more. Rejected, skipped and cancelled each carry a reason, and a
duplicate close carries the work token it duplicates.

SETTLING IS NOT RELEASING. A position stops owing an work token either
because it settled or because it moved elsewhere, and those are two different
acts with two different functions. Judging whether the position may be left
reads both.

THE PERSON-ONLY MARK LIVES ON THE WORK, NOT IN A RULE. A hand meeting it
stops because this work token says so, and consults no list of acceptable
reasons to stop. That is the difference between a fact about the work and a
judgment about the moment.

A COMPUTED WORK TOKEN SETTLES ON ITS OWN ANSWER. It runs when it is asked,
never when it is minted, and a snapshot then stops being recomputed. Without
the declaration a long position can never close, which is the treadmill this
round exists to end.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Yes. The status could be a
field on the work token, an entry in a log the status is derived from, or a
move between places. The statement names none of them.
