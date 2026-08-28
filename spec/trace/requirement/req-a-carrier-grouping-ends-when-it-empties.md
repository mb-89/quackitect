---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-carrier-grouping-ends-when-it-empties
type: "[[requirement]]"
statement: When a grouping that exists only to carry work becomes empty, the system shall remove it.
kind: functional
verify_method: test
breaks_if_removed: Empty groupings accumulate on the surface and a person has to tidy up after every routing decision.
breaks_how_badly: abrasive
refines:
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - uc-route-outstanding-work-to-where-it-is-done step 8
  - raid-dep-the-editor-s-specification-is-a-drawing-the-owner-owns
priority: should
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

IT IS BORN HOLDING WHAT WAS DROPPED ON IT AND DIES WHEN IT EMPTIES. The
grouping has no purpose of its own, so it needs no closing act.

ONE CASE IS NOT SPECIFIED AND THIS ROW DOES NOT COVER IT. What happens when
such a grouping is deleted while it STILL HOLDS work. The drawing is silent,
and the obvious reading — the contents fall back to having no home — would
quietly remove a record's scope.

THAT SILENCE IS THE OWNER'S TO ANSWER. It is one of three already found, and
it is recorded against the drawing dependency rather than guessed at here.
