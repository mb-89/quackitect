---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-debt-the-door-regime-is-built-for-four-doors-and-proved-with-one
type: "[[raid]]"
kind: debt
statement: The rule table takes any number of conversations and three of its parts assume there is exactly one, so a second door would be silently mis-served rather than refused.
owner: the maintainer
status: open
trigger: the record that registers a second door, before it registers it
impact: A second door would count zero governed files on a full tree and report itself UNCHECKED forever, and two behaviours that were fixed this iteration cannot be tested at all until it exists.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - deliverable/engine/doors.ts - governedCount and reachers walk one hardcoded folder
  - deliverable/engine/doorguard.ts - the per-door fold and the plural listedDoors
  - "[[dsp-the-door-rule]]"
weighs_with: none
weighs_against: none
---

## What was taken, and knowingly

THE REGIME WAS BUILT FOR FOUR CONVERSATIONS AND PROVED AGAINST ONE. That is the right order, and it leaves three specific holes.

### The walkers know where only the first door lives

`governedCount` and `reachers` both walk `deliverable/engine` and then filter by the door's own `covers`. A door governing any other folder counts zero on a FULL tree.

That matters more than it did yesterday, because the sweep now reports UNCHECKED and exits non-zero on a zero count. A second door covering the tests would report itself unchecked forever and nobody would know why.

THE FIX IS A `roots` FIELD on the door beside `covers`, so a door says where its files live rather than the walker assuming. It is a change to the door type, which is why it belongs to the record that adds door two.

### Two fixed behaviours cannot be tested until there are two doors

The already-reaches escape now evaluates per door rather than once for whichever matched first. `listedDoors` filters rather than finds. Both were real defects and both are fixed.

Neither can be exercised. Proving them needs two doors reaching one file, and the table holds one entry with no injection seam.

### Why this was not paid now

Adding a second door is the next record's whole job. Building a test-only door to prove a behaviour that has no user yet is scaffolding that would then have to be removed.

The honest position is that the fixes are READ to be correct and not RUN to be correct, and this entry is where that sits until a second door makes it testable.

## Repayment

Three things, in order, and the first two are cheap.

- ADD A `roots` FIELD TO THE `Door` TYPE, beside `covers`, naming the folders a door governs. `governedCount` and `reachers` read it instead of walking a hardcoded `deliverable/engine`.
- REGISTER THE SECOND DOOR. That is the next record's own work and it is what makes the rest testable.
- WRITE THE TWO CASES THAT NEED TWO DOORS. One proves the already-reaches escape is evaluated per door, by giving a file an undeclared reach to door A and a NEW reach to door B and demanding a refusal. One proves the reasonless-departure guard checks every door whose list a path is, not the first.

IT IS REPAID WHEN THE SWEEP REPORTS A SECOND DOOR WITH A NON-ZERO GOVERNED COUNT and those two cases are green. Not before, and no part of it is repaid by reading the code again.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

FIRST DATED LOOK. This entry was minted by the record that is now closing, so no earlier sweep could have read it.

THE TRIGGER HAS NOT FIRED. Its trigger is the record that registers a second conversation, and none has been opened.

THE FIRST REPAYMENT STEP IS CHEAP AND STILL NOT TAKEN. Giving the door type a field naming the folders it governs would remove the hardcoded walk, and it does not need a second door to exist. It is deliberately left with the record that adds one, so the type change and its first real user land together.

RE-ACCEPTED consciously, trigger unchanged.

SWEPT 2026-08-28, at i63's closing retro: RE-ACCEPTED, and the trigger holds.

The trigger is the record that registers a second door, before it registers it.
No second door was registered in this window.

WHAT DID HAPPEN is that the door regime merged into v3 from the
system-exploration branch, and its two clauses renumbered to SE-C-154 and
SE-C-155 because i63 had already shipped the original numbers. The regime is
now on trunk and still proved with one door.

SO THE DEBT IS UNCHANGED IN SUBSTANCE and larger in reach, since the guard now
binds every write on trunk rather than one branch.
