---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-destination-holding-nothing-is-revealed-while-work-is-placed
type: "[[requirement]]"
statement: While a person is placing a piece of work, the system shall show every destination that accepts it, including destinations hidden because they hold nothing.
kind: functional
verify_method: demonstration
breaks_if_removed: The gesture is impossible for exactly the case it is most needed in, because an empty destination is not drawn and there is nothing on screen to aim at.
breaks_how_badly: crippling
refines:
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - raid-risk-a-drag-that-crosses-two-panels-may-not-be-buildable-here
  - uc-route-outstanding-work-to-where-it-is-done step 5
priority: should
weighs_with:
  - none
weighs_against:
  - req-outstanding-work-is-listed-narrowed-and-grouped-in-one-place > a move that cannot find its destination fails the act outright, where a list that will not narrow only slows the reading
  - none
---

## Detail

ACCEPTS MEANS ACCEPTS NOW. The destination shown is one the work can be
dropped on at that moment, not one that might take it later.

THE HIDDEN-ZERO RULE AND THIS ROW PULL AGAINST EACH OTHER, and that tension
is the point. A count of zero is hidden so a finished state reads as
finished. A destination holding nothing is exactly where new work most often
belongs.

SO THE REVEAL IS BOUND TO THE ACT. The destination appears while the work is
in flight and goes again when it lands.

THIS ROW RESTS ON AN UNPROVEN GESTURE. Nothing in this tree drags a thing
from one container into another. Nineteen editors stand, three carry pointer
machinery, and all of it resizes or picks inside one grid.

THE SPIKE RUNS FIRST. Owner instruction, recorded at the kickoff gate as the
first thing to do. Until it has answered, no surface work assumes the
gesture exists.

THREE THINGS THE SPIKE HAS TO ANSWER: that a drag begun in one panel is
received by another, that the payload identifies the work, and that the
receiving panel can change what it shows while the drag is still in flight.
