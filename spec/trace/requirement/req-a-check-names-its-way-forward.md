---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-check-names-its-way-forward
type: "[[requirement]]"
statement: The engine shall refuse to arm a bound check that does not declare how a walk gets past it, so no check can leave the work with no legal move.
kind: functional
verify_method: test
breaks_if_removed: A check refuses the very write needed to repair the rule it enforces. The walk stands with no legal move and the only exit is out of the iteration, which the owner ruled a failure.
breaks_how_badly: fatal
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - raid-risk-a-bound-check-refuses-the-write-that-fixes-it
  - raid-dec-the-walk-never-reaches-a-state-it-cannot-leave
  - uc-keep-the-corpus-sound-at-the-write extension 2c
priority: must
---

## Detail

THIS PRODUCT IS ITS OWN PRODUCT. A check armed here fires on the agent
building the checks, against the files it must edit to fix them.

IT HAS ALREADY HAPPENED ONCE, in the neighbouring mechanism. i11 gave
observe-red an exit script demanding a failure. On re-entry it fired
again, found the tests green, and refused to let the walk leave its own
iteration.

THE FIX THERE WAS REASONED OUT FROM INSIDE THE BLOCK, after the block.
This row moves that cost to authoring time.

## What counts as a declared way forward

THREE ARE KNOWN TO WORK, and a check picks one of them explicitly.

- REPORT INSTEAD OF REFUSE, where the break predates the write. That is
  `req-a-standing-break-reports-and-lands`.
- ACCEPT A SIGNED ANSWER, the shape observe-red ended up with — evidence
  already stamped answers the re-entry.
- CARRY, the shape the close ended up with — the item travels forward,
  counted, on the record.

A CHECK MAY NAME A FOURTH. What it may not do is name none.

## Why the engine refuses rather than a reviewer noticing

A REVIEW CATCHES IT AT REVIEW TIME. By then the check is written, armed
and possibly shipped, and the walk that discovers the trap is the one
that cannot move.

AND THE REVIEWER IS THE PERSON WHO WROTE IT. That is the review the
whole iteration exists to replace.

## The distinction from the standing decision

`raid-dec-the-walk-never-reaches-a-state-it-cannot-leave` covers a STATE
declaring a demand it has no verb to supply. That is enforced by the
compile-time trap check over the machine.

A CHECK IS NOT A STATE. It fires inside a verb, against whatever file is
under the hand, and no check over the machine's shape can see it. This
row is the same principle at the place the machine cannot look.

## Behaviour

NO MODEL WANTED. It is a declaration check on a definition, with no
sequence and no lifecycle.
