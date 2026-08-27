---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: fn-run-a-governed-walk.place-work-where-it-will-be-done
type: "[[function]]"
cluster: the-work
statement: move an work token to the place that will do it, and leave that place owing it
satisfies:
  - req-placing-work-makes-the-destination-owe-it
  - req-a-destination-holding-nothing-is-revealed-while-work-is-placed
  - req-a-carrier-grouping-ends-when-it-empties
  - req-an-open-point-is-ruled-on-at-the-next-checkpoint
inputs:
  - flow-standing-option
  - flow-intent
outputs:
  - flow-work-item
controls:
  - which destinations accept the work at the moment it is being placed
  - the checkpoint's ruling on an open point still standing
source_refs:
  - uc-route-outstanding-work-to-where-it-is-done
  - uc-take-a-step
  - raid-risk-a-drag-that-crosses-two-panels-may-not-be-buildable-here
---

## Rationale

PLACING IS NOT ROUTING. `route-the-work` turns a sentence about wanted work
into the right vehicle to hold it, and it opens records. This function moves
work that already exists onto a position, and the position then owes it. One
answers what vehicle; the other answers which step.

THE DESTINATION OWING IT IS THE WHOLE PURCHASE. Work that lands somewhere and
binds nothing is a note, and a note is what this replaces.

A DESTINATION THAT HOLDS NOTHING HAS TO APPEAR WHILE THE WORK IS IN FLIGHT,
because an empty one is not drawn and there is nothing to aim at otherwise.
That is a property of this act rather than of the surface generally, which is
why it sits here.

A CARRYING GROUP HAS NO LIFE OF ITS OWN. It is born holding what was put in
it and it goes when it empties.

THE CHECKPOINT RULING BELONGS HERE because work placed backwards is the case
that produces it. A gate passing silently over an open point is this act
failing at its far end, not a separate act.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Yes. A drag across two
panels, a picker on the work token, or a command naming both ends. The drawn
surface wants the first and nobody has established it is buildable here, so
the statement deliberately says move rather than drag.
