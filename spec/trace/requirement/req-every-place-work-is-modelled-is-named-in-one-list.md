---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-every-place-work-is-modelled-is-named-in-one-list
type: "[[requirement]]"
statement: The system shall carry one written list naming every place work is modelled, and a later reader shall be able to ask of any place whether it stood on that list.
kind: functional
verify_method: inspection
breaks_if_removed: A place nobody listed is missed, and the break surfaces rounds later as something that used to work and no longer does, with nothing to check the cause against.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - raid-risk-a-place-the-token-change-touches-is-missed-and-breaks-a-later-round
  - "kickoff goal: the architecture analysis later in this iteration sweeps every place work is done"
priority: should
weighs_with:
  - none
weighs_against:
  - req-the-work-editor-needs-no-new-instruction > a missing list leaves a sweep incomplete, where an editor needing one line of instruction costs a reader one line
  - none
---

## Detail

IT IS CROSS-CUTTING RATHER THAN DERIVED FROM A STEP. No pass of either use
case names anybody writing an inventory. What the row protects is that every
pass keeps working after a change that reaches every place work is modelled,
so it names the use cases whose passes it protects rather than the steps it
came from.

WORK IS NOT A SUBSYSTEM. Every state hands it out, every form asks for it,
every method describes it, and the pull returns it. Changing how work is
modelled reaches all four at once.

NO SUCH LIST EXISTS TODAY. Absent it, missing a place is not a coincidence,
it is the default, which is why the register grades that risk expected.

WHAT MAKES THE CLOSURE REAL rather than a promise: the list is written down
and checkable, so a later round asks whether a place was on it instead of
arguing about whether anybody thought of it.

THE STARTING INVENTORY ALREADY STANDS. The inputs gate walked twenty-seven
capabilities one at a time and wrote them out. That is the closest thing to
a first draft of this list.
