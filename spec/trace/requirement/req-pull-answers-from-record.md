---
minted_in: i1
id: req-pull-answers-from-record
type: "[[requirement]]"
statement: When a driver asks what to do, the engine shall answer from the walk's recorded position with one instruction carrying everything the step needs.
kind: functional
verify_method: test
breaks_if_removed: The driver has to reconstruct where it stands and what it may use, which is the whole job the lane exists to remove.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 1
  - ".se/req-mine-sebots.md: state — derived, append-only, on disk"
  - uc-take-a-step step 2
  - ".se/req-mine-sebots.md: rumination — the failure the machine exists to cage"
  - ".se/req-mine-v2.md: errors and refusals"
priority: must
---

## Detail

What the one answer carries:

- When the walk stands on a state whose work is open, the engine shall answer the pull with one packet carrying the state's guidance, the legal tool set, and the owed evidence form.

## Addition — work tokens

WHAT THE INSTRUCTION CARRIES CHANGES, and this is the largest single change
of the work-token round. The answer becomes the pieces of work that stand
open where the walk is and that are ready to be taken, rather than an
instruction the hand has to read a state's whole guidance to act on.

READY IS COMPUTED, NEVER ASKED FOR. Work whose predecessor has not reached
the outcome its edge names is withheld, and the hand is not told to check.

THE ANSWER STILL NAMES THE NEXT ACT. A hand that infers nothing has to be
told which call to make and what to put in it, and handing over work rather
than instructions does not lift that.

WHAT DOES NOT CHANGE. Where the walk may go, how it routes, and what a gate
is. The round changes what a state hands out, not the machine.

THE KICKOFF GATE CALLED THIS THE ONE ARGUMENT FOR GRADING THE ROUND ABOVE
MAJOR, because the pull is the system's one verb.
