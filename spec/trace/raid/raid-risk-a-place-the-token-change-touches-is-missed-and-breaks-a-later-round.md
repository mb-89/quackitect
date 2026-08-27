---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-a-place-the-token-change-touches-is-missed-and-breaks-a-later-round
type: "[[raid]]"
kind: risk
statement: "Work is integral to every part of this system, so a place the token change touches can be missed, and the break surfaces rounds later as something that used to work and no longer does."
owner: the driving agent
trigger: "the architecture analysis's own sweep, and any later round reporting that something which used to work has stopped working"
status: open
impact: "The cost is not this round failing. It is the next several rounds paying for a place nobody listed, each time as a puzzling regression whose cause is a change that shipped and was signed off weeks earlier."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## The hinge

WORK IS NOT A SUBSYSTEM. Every state hands out work, every form asks for it,
every method describes it, and the pull returns it. Changing how work is
modelled reaches all four at once.

THE OWNER NAMED THIS AS THE CENTRAL WORRY, in those terms: we touch a part
that has a lot of impact in a lot of places, and we really need to get it
right.

## Why it is graded expected

THE STANDING CONDITION ALREADY HOLDS. No complete list of the places work is
modelled exists today. Absent that list, missing one is not a coincidence, it
is the default.

The grade is about the course as it stands, not about the course with the
mitigation applied.

## What closes it

THE ARCHITECTURE ANALYSIS LATER IN THIS ROUND, and it is a named goal at the
kickoff gate for exactly this reason. It sweeps every place work is done and
produces the list.

WHAT MAKES THE CLOSURE REAL rather than a promise: the list has to be written
down and checkable, so a later round can ask whether a place was on it.
