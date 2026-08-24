---
form: observe-red
amended: "2026-08-24T20:01:50.594Z by agent — one checked row records a red for a demand the round then reverted, and the line read as a live demand"
by: agent
signed_off: 2026-08-24T17:55:29.477Z
reopened: "2026-08-24T17:54:25.303Z — specify-build was re-signed after this state, so it answered older ground. What changed above it: the chunk drawing gained the four items the phase brief says are owed and the first drawing omitted, and three requirements were amended so each says what the spec under it actually checks. This state has something of its own to record too — the four added items were built before their red could be observed, which is a real break in the test-first order and belongs in its evidence rather than in a green box."
judgment: passed at 2026-08-24T15:47:47.595Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

The reds this state originally observed were observed, and that half of the claim stands untouched.

### Four items were added to the drawing after this state passed

The chunk drawing gained the four the phase brief says are owed here and the first drawing omitted: the route-drawer repayment, the yardstick, the re-signed-answer knock-down, and the score cell.

### THREE OF THEM WERE BUILT BEFORE THEIR RED COULD BE OBSERVED

This is a break in the test-first order and it is recorded here rather than tidied away.

WHAT HAPPENED. The walk stood on this state while the four were being worked. The build landed first, so any check written for them now is green from its first moment — which this state's own guidance calls out by name: green from birth proves nothing.

WHY IT IS NOT REPAIRABLE BY WRITING THE CHECKS NOW. A check authored after the code it checks cannot be shown failing without undoing the code. Writing one and calling it test-first would be the fabrication this state exists to prevent.

WHAT IS TRUE INSTEAD. Three of the four have working behaviour and no observed red. The fourth, the knock-down, has neither: its cause is unknown and it carries an open issue rather than a build.

### What the four actually are

- The route-drawer repayment is verified by observation rather than by a red: the sweep's own message changed in the wild from naming a refusal to naming a state still deciding.
- The yardstick records per-hop walking times against the pinned run, and reports their median.
- The score cell no longer charges a candidate for axes nobody scored.
- The knock-down is [not built and says so](spec/trace/raid/raid-iss-the-knock-down-has-no-reproduction-of-the-case-that-fails.md).

## red_observed

- [x] every hop records how long it took — the search returns steps carrying no duration at all, so the assertion fails on the very unit the row is about
- [x] a failed route answers no slower than a drawn one — neither a found route nor a failed one reports what it visited, so the two cannot be compared and no bound can be held
- [x] pointing the walk costs the same whatever the distance — the red was real and the DEMAND WAS THEN REVERTED, so nothing holds this row today: setting the direction draws the whole route on purpose, because the drawing is the only answer to whether a target is reachable, and measuring proved the drawing was never the cost
- [owed] the surface answers no worse while the engine is busy — raid-iss-the-surface-row-has-no-harness-that-could-fail-it

## follow_up

### The order this round walked is the finding, not the four items

BUILDING BEFORE THE RED IS WHAT THE RETROSPECTIVE DRAWING MADE EASY. The first chunk drawing listed only what had already been built, so the four missing items were invisible until a cold reviewer read the phase brief. By the time they were chunked, the walk stood past this state.

A DRAWING WRITTEN FIRST WOULD HAVE PUT THEM IN FRONT OF THIS STATE, where their reds could have been seen.

### What is owed at verification

The three built items need checks, green from birth or not, because a regression guard is worth having even when it could not be watched failing. The fourth needs its reproduction before anything is aimed at it.

THE GATE SHOULD RULE ON WHETHER THAT IS ENOUGH. It is the adjudication this round's own principle puts there.

## anything_else

