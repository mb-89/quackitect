---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-debt-the-merge-is-committed-and-cannot-be-pushed
type: "[[raid]]"
kind: debt
statement: The owner authorised a push out loud and the lane refuses every push without exception, so i16 and its merge with i17 stand committed on the local v3 and reach nobody until a person runs one command.
owner: the owner
status: open
breaks_how_badly: corrosive
how_likely: certain
impact: "Nine commits sit ahead of origin/v3, including the whole of i16 and a 49-commit merge that resolved 35 conflicts and renumbered a clause. None of it is visible to another machine or another person. A second agent starting from origin gets a tree where SE-C-143 does not exist and i16 never happened, and would mint over the same numbers again."
source_refs:
  - raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker
---

## What was taken, and by whom

THE OWNER AUTHORISED THE PUSH IN AS MANY WORDS, 2026-08-18, leaving for the
night: "I want you to pull from remote after you're done with the iteration,
and I want you to merge everything in and then also push that when you're done
with the merge. So I explicitly allow you to push here. You can do that."

THE LANE REFUSED IT. SE-C-003 says pushing is the owner's act, and its rule in
`guidance/refusals.md` is absolute: "Every push refuses here, without
exception." The refusal's own remedy is to commit locally and list what is
ahead.

THE REFUSAL WAS RESPECTED RATHER THAN ROUTED AROUND. A shell could have run
`git push` in one line. Contract rule 1 forbids working around a refusal with
another lane, and the deeper reason is that the authorisation was given in the
belief that pushing was available to the agent. It is not, and the guard that
blocks it is one the owner built. Defeating a hard guard on a sentence written
without knowledge of it teaches the system that its guards are advisory.

## What is owed

ONE COMMAND, BY A PERSON, IN THE REPOSITORY ROOT:

    git push origin v3

## What is NOT owed, so the debt is not overstated

NOTHING IS UNFINISHED OR UNSAFE. The merge is committed, the tree is clean,
and the battery is green at 1433 of 1433 with biome, preflight and the
conformance sweep all passing. The work is complete and stationary.

## The decision this leaves open

WHETHER SE-C-003 SHOULD TAKE AN AUTHORISED PUSH AT ALL. Two readings are
honest and the owner has to pick one.

- KEEP IT ABSOLUTE. Pushing stays a person's act, and an agent that has
  finished work says so and stops. The cost is exactly this row, once per
  unattended run.
- MAKE IT DIAL-BOUND. A push becomes a step with a weight, so the autonomy
  dial decides it the way it decides every other step, and a session the owner
  set high can publish. The cost is that an unattended agent can reach a
  remote, which is the one act in this system nothing else can undo.

THE SECOND IS THE LARGER CHANGE and it is not obviously right. It is recorded
here rather than decided by an agent that wanted the door open.

## How it comes due

IMMEDIATELY, AND IT IS ALREADY DUE. Every hour this stands is an hour where
the only copy of i16 is one working tree on one machine.
