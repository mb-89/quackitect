---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-hand-may-break-work-into-parts-and-the-parts-are-visible
type: "[[requirement]]"
statement: When a hand finds a piece of work larger than its mark says, the system shall let that hand create parts beneath it, and shall show those parts under the work they came from.
kind: functional
verify_method: test
breaks_if_removed: A hand meeting work too large has only two moves, doing all of it in one go or raising the mark and leaving it, and the person watching sees a single work token sit open with no account of what is happening inside it.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "uc-work-a-states-work-tokens-to-completion extension 6c: the hand creates parts beneath it and works those, and the parts are visible as the hand's own reasoning"
  - "uc-read-what-the-system-owes-and-what-it-is-doing extension 6b: the person reads how the hand broke the job down without asking it"
  - req-work-says-when-a-hand-is-on-it
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THE PARTS ARE THE HAND'S REASONING MADE VISIBLE, and that is the whole point.
A person reads how the work was broken down without asking, which is the one
thing the narration machinery bought and the one thing its removal would
otherwise cost.

CREATING A PART IS NOT PLACING WORK. The parts belong beneath the work token
they came from, on the same state, rather than being routed anywhere.

WHAT THE PARENT DOES WHILE ITS PARTS ARE OPEN is the design's to choose. Two
honest answers exist: the parent settles when its parts do, or the parent is
itself just another piece of work the state blocks on. Neither is decided
here.

THE COUNT HAS TO STAY HONEST EITHER WAY. Whatever the design picks, what a
state shows as outstanding cannot count one work token as several or several
as one without saying which it did.

## Why this row exists at all

IT WAS MISSED, AND THE MISS IS INSTRUCTIVE. The first pass folded the
watching half of this into a standing row about reporting work out of sight.
That row demands parts appear in the answer where they exist. Nothing demanded
that a hand may make them.

A COLD REVIEWER FOUND IT by walking the use-case steps, which is the check the
first pass replaced with a walk over a capability list.
