---
form: record-adrs
by: agent
signed_off: 2026-08-21T10:08:13.689Z
authors: agent
files:
---

# Evidence form / record-adrs

## current_situation

The winner is declared and grafted, and a second hand re-scored it. This state records why, once.

Four decisions land, one per row of the chart the winner settles. Each is a register entry with `kind: decision` rather than a document of its own, per the 2026-08-10 ruling.

All four grade crippling, so all four are ADRs. Nothing here is graded lower and quietly called one.

## adrs

- [[raid-dec-a-long-step-acknowledges-first-and-reports-on-a-clock]]
- [[raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three]]
- [[raid-dec-the-duration-and-its-basis-are-one-return-value]]
- [[raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it]]

## follow_up

The structure is decomposed next, then the architecture is evaluated and gated.

THREE CONSEQUENCES ARE BUILD CONSTRAINTS rather than description, and the decomposition should carry them as such.

- The duration and its basis come from ONE computation returning both. Two fields filled independently is how a basis goes stale.
- Every existing reader of a two-value standing changes, and three are named. A reader that has not been updated must fail loudly rather than see a passed.
- The door is the guarantee and the rider is the optimisation. A design that drops the door has kept the fast path and lost the correct one.

AND ONE UNMEASURED NUMBER GOES TO THE DESIGN. The progress clock's interval is not sized. The predecessor's minute was sized for a person watching a screen, and the caller here is a program.

## anything_else

THE REJECTED OPTIONS SECTIONS ARE WHERE THIS STATE EARNED ITS COST, and two of them record something uncomfortable.

THE SEPARATION IN TIME LOST ON A TECHNICALITY. Three of four candidates took it and it was never beaten on its own row — it lost because the seat went to the line carrying the rider. The ADR says so plainly and names it as the fallback if the progress clock proves unmeetable.

AND THE NULL OPTION LOST ON SCOPE RATHER THAN ON MERIT. `opt-ship-the-non-freezing-exit-and-no-estimate-at-all` is the only design in the set that cannot make a false claim about the future. It was refused because the iteration's first goal demands a duration, and a graft may not strike a goal.

BOTH ARE LOSSES THAT WOULD LOOK LIKE DEFEATS IN A SUMMARY and are not. Recording why is the whole point of the section: an option struck without a reason gets reinvented next iteration by somebody who had no way to know it was considered.

ONE CONSEQUENCE IS THE ITERATION'S OWN SHARPEST RISK, and it is written into the fourth ADR rather than left in a review. A rider that appears only when there is something to say is ABSENT when there is nothing, and absent is indistinguishable from never emitted. The door is what closes that. That is why the third graft was taken after the re-score rather than before it.
