---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-work-outside-a-record-goes-when-its-state-completes
type: "[[requirement]]"
statement: When a state outside a record completes, the system shall remove the work that state carried and shall keep the evidence that work produced.
kind: functional
verify_method: test
breaks_if_removed: Boot and the front desk accumulate finished work tokens forever, so a count of what is owed is dominated by work nobody is waiting for.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "kickoff goal: outside a record everything is ephemeral"
  - uc-work-a-states-work-tokens-to-completion extension 9a
  - uc-read-what-the-system-owes-and-what-it-is-doing extension 8a
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THE GUARANTEE IS NARROWER OUTSIDE A RECORD, and it is stated rather than
left to be discovered. What survives is that a state cannot be LEFT with
work open. The trail of which work tokens existed does not survive.

THE EVIDENCE DOES SURVIVE. A reading proven outside a record stays proven,
because the proof is version-keyed and durable rather than carried by the
work token.

SO THE TRAIL RECORDS WHAT WAS PRODUCED rather than what was pending, which
is the honest thing for a state nobody archives.

## Unfinished hand work is carried, never removed

THE SEAM IS WHO CAN BRING THE WORK BACK, and this requirement's headline is
true of one side of it and false of the other.

A MACHINE-MINTED TOKEN IS MINTED AGAIN. A reading, a marked step, an evidence
demand — each is derived from the state's own card, so the next entry produces
it afresh. Removing an unfinished one loses nothing.

A HAND-OPENED TOKEN IS MINTED BY NOBODY. Nothing derives it, so nothing brings
it back. Removing an unfinished one destroys it.

SO AN UNFINISHED HAND TOKEN MOVES TO THE BACKLOG and the caller is told which
ones moved. The backlog is where work sits when nobody has said where it will
be done, which is exactly true of work a completing state did not finish.

WHY THIS SECTION EXISTS. Measured on i63, 2026-08-27: with emergency armed the
leaving guard was lifted, a state completed over seven open hand tokens, and
every one was deleted with no trace and no report. The code carries the seam
now. This text did not, so a reader meeting the headline alone would
reintroduce the deletion.

IT IS NOT THE LEAVING GUARD, and must not be read as one. The guard refuses the
completion outright and emergency lifts it on purpose. This is what happens
once the completion is allowed anyway.
