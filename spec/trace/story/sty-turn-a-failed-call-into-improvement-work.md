---
minted_in: i36
id: sty-turn-a-failed-call-into-improvement-work
type: "[[story]]"
statement: An agent recovers from a failed tool call and routes its failure shape into durable improvement work without leaving the walk.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An agent makes a lane call that refuses, errors or is cancelled.
|||
HAPPENED, repeatedly, on 2026-08-19. A `se_file_read` carrying `startLine`
and `endLine` was refused SE-C-101. A `se_file_patch` using `find` and
`replace` was refused SE-C-046. A `se_file_glob` called with `pattern`
instead of `glob` was refused outright. Every one is in `.se/calls.jsonl`.

---

The lane classifies the failure as misuse, unclear contract, host behavior or engine defect.
|||
PARTLY. The clause classifies it and the remedy names the fix, so misuse is
distinguishable at the call. The four-way classification exists in
`engine/failure-shapes.ts` as `MISUSE_CLAUSES`, and nothing calls it, so no
classification is recorded anywhere a later session can read.

---

The agent follows the immediate remedy and keeps the current work moving.
|||
HAPPENED, every time. Each refusal carried an executable remedy naming the
correct argument, and each was recovered in one turn without leaving the
state. That half of the story works today and needed no change.

---

Repeated non-misuse failures appear in the active iteration with their counts and evidence.
|||
DID NOT HAPPEN BY MACHINE. `recurringShapes` counts them and no production
path calls it. It happened by hand instead: the repeated `spill read failed`
shape was counted by reading a battery run, and it became the
`spill-is-per-server` chunk.

---

The iteration either fixes the failure shape or carries it through a RAID entry with an owner and trigger.
|||
HAPPENED, by hand. Two shapes were fixed in code — the spill directory and
the two guards refusing the lane's own cursor. Two were carried as register
entries with an owner and a trigger:
`raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` and
`raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface`.

---

At close, the owner can see which failed calls changed the product.
|||
PARTLY, and only because a person wrote it down. The chunk evidence names
the failing shape that caused each fix, so the trail exists and is readable.
It is authored, not derived, so it is only as complete as the author was.

## Unlike

A retry repairs one call.

A local note preserves one observation.

This story connects recovery to measured product improvement.

## What this deck does not claim

THE MACHINE HALF IS NOT BUILT. Slides four and six describe a derivation
nothing performs. `raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface`
carries the repayment, and this deck is honest about standing on hand work
until it is repaid.
