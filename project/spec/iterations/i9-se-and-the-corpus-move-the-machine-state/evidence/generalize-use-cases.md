---
form: generalize-use-cases
by: agent
signed_off: 2026-08-19T12:29:35.742Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

Two stories stand from write-stories: sty-ramp-up and sty-work-on-two-machines.

Two use cases sit over them. uc-install-quackitect refines sty-ramp-up. uc-start-an-unattended-machine refines sty-work-on-two-machines.

The collapse invalidates one of the two. uc-install-quackitect described two folders as though they were one. Step 1 said "the product's folder" and meant the outer one. Step 3 said "opens the workspace on that folder" and meant the inner one. Both sentences read fine and named different places.

uc-start-an-unattended-machine survives unchanged, and it was read rather than assumed. It names no absolute location. Its "this root" in extension 3a means the same thing before and after, because a root is relative to whatever the run holds.

uc-drive-a-foreign-product survives too. It was checked because i9 already softened it at gate-kickoff. Its extension 1z already says the act "ends with the builder working in that tree", which is the folder model this iteration is generalising. It carried the collapsed shape before the collapse was written down.

## use_cases

- project/spec/trace/use-case/uc-install-quackitect.md

## follow_up

Step 2 is a guarantee with no mechanism under it. The person finds what to run without being told, and nothing yet says what sits there. raid-iss-the-collapse-hides-the-one-thing-a-newcomer-must-run carries it, and the design milestone owns the answer.

Extension 5b is the owner's no-seeding ruling in use-case shape. A folder with no machine state is reported plainly, never seeded. Requirements should carry it as a requirement of its own, because it is a refusal a person meets rather than a step in a scenario.

Steps 8 and 9 are the entry-point goal's pass line. Requirements should state them as a testable claim: a second start runs no script.

The withdrawn story bridged in uc-start-an-unattended-machine is still owed a deletion. The owner asked for it on 2026-08-15, at the first state that grants se_file_delete. i9 does not reach one, so it stays owed.

## anything_else

ONE USE CASE IS LISTED BECAUSE ONE WAS TOUCHED. Three were read to decide that, and the two that survive are named in the situation above with the sentence that saved them.

A use case that stays true through the move is not evidence the move is small. It is evidence the use case named a goal rather than a place, which is what a use case is for.
