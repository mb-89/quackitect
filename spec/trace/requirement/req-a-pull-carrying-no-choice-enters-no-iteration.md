---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: req-a-pull-carrying-no-choice-enters-no-iteration
type: "[[requirement]]"
statement: If a pull reaches the iterations container carrying no choice, then the engine shall enter no iteration and shall answer with the offer.
kind: functional
verify_method: test
breaks_if_removed: A dropped connection binds a record nobody chose and stamps it started.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
  - uc-take-a-step
source_refs:
  - note-998a61a15659
  - raid-iss-a-blocked-walk-can-kill-the-connection-instead-of-refusing
priority: must
---

## Detail

THE OWNER RULED IT, 2026-08-16: "We need a state before the iterations that's
called selection or something like this so that when we enter the iteration
state machine, we don't automatically enter the first iteration."

THE CONTAINER ALREADY PROMISES THIS AND DOES NOT KEEP IT. Its own guidance
reads "PICK ONE way forward — with several open the pull OFFERS them rather
than entering one for you." Observed three times on 2026-08-16: after a
dropped socket, a bare recovery pull entered `iterations/i4` — the first
alternative in the offered list.

WHY IT IS CRIPPLING RATHER THAN ABRASIVE. Entering BINDS a record and stamps
it started, via `markStarted` at engine/iterations.ts:233-241. i4 survived only
because it was already started and the function returns early. A freshly seeded
stub would have been started by a connection failure, with no person choosing
it and nothing recording that nobody did.

THE SHAPE OF THE FIX is a selection state standing between the container's
start and the per-iteration machines. Entering the container lands there and
stops. Nothing binds until a choice arrives.

THE TEST: drive a pull with no form at the container and assert that the
answer offers, that no record's status moves, and that no `started:` stamp is
written.
