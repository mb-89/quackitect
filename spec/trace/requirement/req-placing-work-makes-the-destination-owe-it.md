---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-placing-work-makes-the-destination-owe-it
type: "[[requirement]]"
statement: "When a person places a piece of work on a destination, the system shall make that destination owe it, so the destination cannot be left until the work is settled or moved on again."
kind: functional
verify_method: test
breaks_if_removed: "Routing becomes a suggestion. Work lands somewhere and nothing holds that place to it, which is what a note already does and why a note is not enough."
breaks_how_badly: crippling
refines:
  - uc-route-outstanding-work-to-where-it-is-done
  - uc-take-a-step
source_refs:
  - "uc-route-outstanding-work-to-where-it-is-done steps 4, 6 and 7 and extensions 4a, 4b and 4c"
  - "frame-delta: every build milestone gets a debt-reduction step with a small budget, seeded from the pool"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

FOUR DESTINATIONS, AND EACH ONE IS A STEP OR AN EXTENSION OF THE JOURNEY.

| destination | what placing it does |
| --- | --- |
| a new record | the grouped work becomes that record's scope, arriving at its opening checkpoint without being retyped |
| a state in a running record | the state owes it from that moment, as an open point |
| a build step for repaying debt | small work is routed there as the build steps are made, within that step's budget |
| out of scope | the work returns to having no home; its status does not change |

PLACING IS THE POOL'S ONLY EXIT, and today the pool has none. It can be
added to and read, and nothing removes an item, edits one or merges two.
Moving an item onto a state is how it leaves, and that is ordinary work
rather than an exception.

A FINDING IS ONE OF THE THINGS PLACED. A step that turns up a defect
blocking nothing makes it work in its own right and places it on the state
that will fix it, rather than on a list somebody routes afterwards. The walk
continues, and the finding is owed where it will be done.

EARLIER IN A RUNNING RECORD IS A LEGAL DESTINATION. The work is placed on
the state that owns what must change, and it stands there as an open point
rather than reopening anything.

THE DEBT STEP NEEDS A WAY TO TELL SMALL WORK FROM LARGE, and the difficulty
mark already exists for routing. Whether it serves is the design's to say.
