---
minted_in: i36
id: tsp-a-failed-call-becomes-work
type: "[[test-spec]]"
statement: An agent recovers from a refused lane call in one turn, and a failure shape that keeps recurring ends the iteration as a fix or as a register entry with an owner and a trigger.
method: demonstration
demonstrates:
  - sty-turn-a-failed-call-into-improvement-work
verifies: "none — demonstrates: carries the edge; req-repeated-failure-shape-becomes-durable-work is verify_method: test and is carried by tsp-repeated-failure-shape-becomes-durable-work"
files:
  - none — a demonstration over a live walk; the trail is the call log, the register and the iteration evidence, and no file carries it
---

## Scope

The whole arc from one refused call to something a later session can act on.

- The refusal carries a remedy and the agent recovers without leaving the state.
- A shape that recurs is counted rather than absorbed.
- The count ends as a fix or as a register entry naming an owner and a trigger.
- The owner can see at close which failures changed the product.

WHAT IS DELIBERATELY OUT. Preventing the failure. A refusal that teaches is
the system working.

## Approach

DESIGN METHOD: end-to-end demonstration over a real walk, because the arc
only exists across many calls and one iteration.

LEVEL: system. The call log holds the failures, the register and the pool hold
the durable work, and the iteration evidence holds the trail between them.

DEPTH: medium. The recovery half fails loudly. The derivation half fails
silently, which is why the steps below ask who performed each one.

## Procedure

- A refused call carries an executable remedy and is recovered in one turn.
- A shape seen once produces no durable work.
- A shape seen repeatedly produces exactly one piece, with an owner and a trigger.
- A misuse shape produces none, however often it repeats.
- The close shows which failed calls changed the product.

## What the 2026-08-19 run actually showed

THE RECOVERY HALF IS GREEN AND NEEDED NO CHANGE. Several refusals — a wrong
argument name, a wrong patch field, a wrong glob key — each carried the
correct call and each was recovered in one turn.

THE DERIVATION HALF WAS PERFORMED BY HAND. `recurringShapes` counts nothing
in production, so a person read a battery run, saw the repeating
`spill read failed` shape, and turned it into a build chunk. The steps above
are red until
`raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface`
is repaid, and this spec is where that shows.
