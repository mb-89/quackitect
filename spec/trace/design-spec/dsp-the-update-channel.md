---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: dsp-the-update-channel
type: "[[design-spec]]"
statement: A vehicle takes upstream's later work by running it against the files it now holds, deciding collisions once against a list of what it made its own, and leaving the result unkept until a person accepts it.
realizes:
  - el-update-runner
  - el-change-reporter
  - if-change-reporter-to-update-runner
files:
  - deliverable/engine/update.ts
---

## Half of this is built, and the seam between the halves is exact

`engine/update.ts` CARRIES THE REPORTER AND NOT THE RUNNER.

- [[el-change-reporter]] IS BUILT. `inventory(vehicleRoot)` answers what a
  vehicle made its own, derived from the vehicle's own repository.
- [[el-update-runner]] IS NOT. Running an arriving program needs a program
  FORMAT, and what a program may say is not designed anywhere. Writing a runner
  for a format nobody has specified would be fabrication rather than progress,
  and it is exactly what
  [[raid-tripwire-i16-a-structural-migration-cannot-be-written]] probes.

THE OWNER RULED THE PRIORITY, 2026-08-18: "an engine update is something that
you don't do automatically. You decide to make that update... Right now, I just
wanna get the engine to run." The build plan carried six chunks and none of
them was the update channel.

SO WHY IS THE REPORTER BUILT AT ALL. Because the inventory is an answer in its
own right — a vehicle's owner can ask what they made their own without taking
any update — and because [[req-overlay-drift-reported]] clause two demands it
whether or not an update ever arrives.

AND BUILDING IT CAUGHT A STALE ELEMENT. [[el-change-reporter]] said it "could
not run at all" under a vehicle sharing no commit with its engine, which is the
vehicle the owner actually ruled for. The conclusion was written against a
clone and did not follow the premise across. A copy has its own root commit and
that commit IS the vendored content, so the base is still local. The element
stood self-defeating through the whole build, and only realizing it found that.

AN EMPTY `files:` WAS TRIED FIRST AND IS WRONG. It reads as "this design has no
code anywhere", which loses the one fact a later builder needs. The engine
refuses it at specify-build, and the refusal is right.

## Responsibility

TWO PIECES AND ONE HANDOVER BETWEEN THEM.

- ASKING WHAT THIS VEHICLE MADE ITS OWN. Every path where its content differs
  from the version it was built from, framed as what was made own rather than as
  what has wandered.
- RUNNING WHAT ARRIVES against the files as they now stand, and leaving the
  result readable before it is kept.

THE INVENTORY IS AN INPUT TO THE RUN, NOT A BY-PRODUCT OF IT. A vehicle's owner
can ask what they changed without taking any update, and an update cannot be
decided without that answer.

## NOT BUILT IN THIS ITERATION, and that is a ruling rather than a slip

THE OWNER, 2026-08-18: "I consider an engine update as something that you don't
do automatically. You decide to make that update... If you have to merge with the
merge tool, that's okay. We can think about the ergonomics of that later. Right
now, I just wanna get the engine to run."

SO THIS SPEC IS DESIGN AND NOT SCHEDULE. It exists because every element owes a
spec and because the next person to pick this up should not start from nothing.
note-c20924dedaea carries the ruling.

## Interface

IN: what arrives from upstream, and the inventory of what this vehicle changed.

OUT: a changed working tree, left unstaged, and nothing else. No report is
written, no state is recorded, and nothing is committed.

THE HANDOVER IS AN IN-PROCESS CALL made once at the start of an update rather
than per instruction, and [[if-change-reporter-to-update-runner]] carries its
contract.

## Behavior and constraints

NO GIT MERGE IS AVAILABLE, and this is the constraint that shapes everything
else. [[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]] makes a
vehicle a copy with its own fresh repository, so it shares no commit with the
engine and no three-way merge has an ancestor to stand on.

SO THE MECHANISM READS THE VEHICLE'S FILES AS THEY ARE. It addresses what to
change rather than where, which is why it survives a vehicle having moved or
restructured a file.

ONE VERSION SPAN AT A TIME. Taking several at once makes the result unreadable,
and readable is the only thing standing between a migration and a silent wrong
answer.

AN EMPTY INVENTORY IS A LEGAL ANSWER and an unbuildable one is not. If the base
version cannot be found the answer is a refusal naming what is missing, never an
empty list — empty means apply everything and missing means apply nothing, and
both arrive looking like "no paths".

## What it does not prevent, stated because it is the sharpest thing here

A RUN THAT SUCCEEDS AND PRODUCES SOMETHING WRONG. What arrives is authored by
somebody who has never seen this vehicle, and nothing here can know what they
meant.

WHAT IT DOES INSTEAD IS PUT THE RESULT IN FRONT OF A PERSON. That is weaker than
a merge conflict, honestly weaker, and
[[raid-asm-a-vehicle-owner-reads-the-update-diff]] is the assumption it leans on
— graded crippling and deferred, because only a real update by a real person can
settle it.

## Rationale

THE PROGRAM SHAPE WON BY ONE CELL and then the ground moved under the comparison
twice. [[exp-a-structural-rename-across-a-vehicle]] measured git handling the
realistic case, which narrowed the advantage; the copy ruling then removed git
from the field entirely.

SO THE SHAPE IS NOW THE ONLY ONE THAT WORKS rather than the one that scored best.
With no common ancestor, addressing by identity is what is left. A declared patch
series would also work and is fussier about exact line positions.

AND THE FORMAT IS THE EXPENSIVE HALF, undesigned on purpose. What an instruction
may say decides whether an engine change can be expressed at all, which is what
[[raid-tripwire-i16-a-structural-migration-cannot-be-written]] probes and what
the owner has said can wait.
