---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-step-that-would-seed-a-submachine-takes-work-instead
type: "[[requirement]]"
statement: Where a step today seeds a machine beneath itself, the system shall give that step its own pieces of work instead, and shall carry work onward by moving it rather than by seeding.
kind: functional
verify_method: test
breaks_if_removed: A whole level of machine survives beside the thing that replaces it, so the same work is modelled twice and a count on a state is blind to whatever hangs below it.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - "record.md line 42: submachines mostly stop existing, a spike takes tokens instead of seeding a submachine, build steps take tokens instead of seeding a submachine"
  - "gate-kickoff change_size: it removes a submachine level, since where the machine spawns a submachine it will spawn tokens instead"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THREE PLACES SEED A MACHINE TODAY and each becomes work on the step itself.

| what seeds a machine now | what it takes instead |
| --- | --- |
| a spike | its own pieces of work on the spike step |
| a build step | its own pieces of work on that step |
| a record's opening checkpoint | the record's work, which it does not do but moves onward |

PROMOTING A SPIKE IS A MOVE. Its work is not closed; it is placed on the
build step, which is the ordinary act rather than an exception.

MOSTLY, NOT ENTIRELY. The word is the record's own, and this row does not
claim every machine beneath a machine disappears. What it demands is that
seeding one stops being how a step carries work.

WHY IT IS CRIPPLING RATHER THAN CORROSIVE. A count on a state is the surface
this round sells, and a state that hides work inside a machine below it
reports a number that is wrong by everything down there.
