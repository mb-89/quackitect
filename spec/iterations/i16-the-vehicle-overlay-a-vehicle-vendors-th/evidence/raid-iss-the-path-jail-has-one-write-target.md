---
form: raid-iss-the-path-jail-has-one-write-target
by: agent
signed_off: 2026-08-18T16:02:08.663Z
authors: agent
files: null
---

# Evidence form / raid-iss-the-path-jail-has-one-write-target

## current_situation

SPIKE ANSWER: YES, AND IT IS ONE BRANCH RATHER THAN A REDESIGN. Closed at 6 of 20 lane calls.

### The mechanism already exists

`.se/roots.json` ALREADY DECLARES FOLDERS OUTSIDE THE PROJECT ROOT, reachable as `@name/rest`. resolveDeclaredRoot in engine/paths.ts resolves them, and the agent writes the declaration itself through the lane rather than sending a person to hand-edit a dotfile.

SO NOTHING NEW IS NEEDED TO NAME A FOREIGN TREE. What is missing is permission to write to one.

### The containment guard is already built

engine/paths.ts LINES 75 TO 83. After resolving `@name/rest`, the result is checked against the declared base and anything climbing out is refused with PATH_ESCAPE. That is the guarantee that makes a declared target safe: you cannot escape the tree you were pointed at.

IT IS THE SAME SHAPE THE PROJECT ROOT GETS from resolveInRoot lines 106 to 122. Two bases, one containment rule, already written twice.

### Read-only is exactly one branch

engine/paths.ts LINES 93 TO 105. resolveInRoot throws PATH_ESCAPE on ANY root-ref, with the message "a declared root is READ-ONLY". That single `if` is the entire enforcement.

READ LANES CALL resolveForRead, which routes a root-ref to resolveDeclaredRoot. WRITE LANES CALL resolveInRoot, which refuses it. The split is by which function the verb calls, and nothing else.

### AND THE GUARD IT ALL RESTS ON IS UNTESTED

tests/roots.test.ts HAS FOUR CASES and none of them covers this.

- An `@` address routes to the project root whatever else is bound.
- Everything else answers from the work root.
- The glob and search handlers pass their selector to the root chooser.
- A declared root is never reported as undeclared.

WHAT IS ASSERTED NOWHERE: that resolveInRoot refuses a root-ref, and that resolveDeclaredRoot refuses a path climbing out of its base. Both are implemented. Neither is proved.

SO THE HONEST STATE IS that the shape works, the guard exists, and the guard has never been exercised by a test.

### One thing found in passing

tests/roots.test.ts OPENS WITH SIXTEEN LINES ABOUT A BOUND WORKTREE, the concept the owner ruled obsolete today. The test is live and correct; its explanatory comment describes a mechanism i34 retired. One more instance of note-7432b8a852f6.

## built

- none

## follow_up

THE CHANGE HAS THREE PARTS and the third is the one nobody has written.

### One, the declaration gains a permission

`.se/roots.json` MAPS NAME TO PATH TODAY. It would map name to path plus whether the root is writable. Every root declared before the change stays read-only, which is the safe default and needs no migration.

### Two, one branch changes in the resolver

resolveInRoot STOPS REFUSING ROOT-REFS UNCONDITIONALLY. A writable root-ref routes into resolveDeclaredRoot, which already contains it. A read-only one keeps the refusal it has now, and the message names WHICH so a caller learns whether the root is unknown or merely not writable.

NOTHING IN THAT WEAKENS THE JAIL. The containment check does the work in both cases and is unchanged.

### Three, a guard that does not exist yet

A DECLARED WRITE TARGET MUST NEVER BE THE ENGINE'S OWN TREE, or a vehicle could write back to the thing it came from. That is the fatal rule this iteration is built on, and no code checks it today because no write target has ever been declarable.

gate-architecture NAMED THIS AS OVERRIDE SIX: the check that a declared target can never be the source is owed WITH the change rather than after it. This spike confirms the check is genuinely absent rather than merely unlocated.

### Two test cases come first, and they are the point

WHOEVER MAKES THE CHANGE WRITES THESE BEFORE TOUCHING THE RESOLVER, because they are what stops the change being a hole.

- resolveInRoot REFUSES a read-only root-ref, with the clause it claims.
- resolveDeclaredRoot REFUSES a path that climbs out of its declared base.

BOTH DESCRIBE BEHAVIOUR THAT ALREADY EXISTS, so both should pass on the unchanged engine. A red there means the guard was never real, which is worth knowing before anything is built on it.

### What this spike did not settle

WHETHER A DRIVEN PROJECT NEEDS A WRITABLE ROOT AT ALL, or whether the producer writes it once and the seam only reads afterwards. if-project-producer-to-resolution-seam says the producer writes a record into the driven tree and the seam reads it on every arrival. If nothing writes after production, the permission is needed for one act rather than for the walk.

THAT IS A DESIGN QUESTION FOR M7 and it narrows the change further rather than widening it.

AND THE SCOPED RUN handed off as job test-msyun0bj-2 answers whether the suite is green, which is a different question from what it covers. The coverage answer above comes from reading the four cases.

## anything_else

