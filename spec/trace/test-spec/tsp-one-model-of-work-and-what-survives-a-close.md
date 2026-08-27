---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-one-model-of-work-and-what-survives-a-close
type: "[[test-spec]]"
statement: A tree modelling work two ways is refused, a closed record still answers how its work was done, the folded format can be changed later, and two hands writing at once do not collide.
method: test
verifies:
  - req-a-tree-that-models-work-two-ways-refuses
  - req-how-a-record-was-worked-survives-its-closing
  - req-a-storage-shape-chosen-for-the-archive-can-be-changed-later
  - req-two-hands-writing-work-at-once-do-not-collide
files:
  - tests/work-one-model.test.ts
---

## Scope

WHAT IT COVERS: the properties that hold ACROSS the whole tree rather than
inside one act — one model, a readable past, a changeable format, and two hands.

WHAT IS OUT: the fold's own performance, which is measured rather than tested,
and whether an agent can read a folded record, which is a guard question with
its own register entry.

## Approach

FAULT-BASED for the two-models row. The check constructs the fault deliberately
— a tree carrying work in the new shape AND in an older one — and asserts the
refusal, because a rule nobody can trip is a rule nobody has.

SCENARIO for the closing row: work a record, close it, then ask the three
questions its requirement names and assert each is answerable.

CROSS-CHECKS FOR THE FORMAT ROW. Fold under one format, change the format,
migrate, and assert that every item held before the change is reachable after
it — counted per item rather than per record, because a record that survives
with items missing passes a per-record check.

TWO HANDS ARE SIMULATED, not run in parallel. Two clones write the same position
and the merge is asserted to need no person. Real concurrency is not the
mechanism under test; the merge surface is.

INTEGRATION LEVEL, because every row spans more than one part.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- A TREE CARRYING WORK IN TWO SHAPES IS REFUSED, and the refusal names both
  shapes rather than reporting a generic conflict.
- A CLOSED RECORD ANSWERS HOW ITS WORK WAS DONE, not only what it concluded.
  Its three questions each get a case.
- A FOLDED RECORD IS READ BACK AT ITS RECORDED COMMIT, and the commit is on the
  record rather than inferred.
- CHANGING THE FOLDED FORMAT LOSES NO ITEM. Counted per item, before and after.
- TWO HANDS WRITING ONE POSITION MERGE WITHOUT A PERSON, and the case asserts
  both hands' changes are present afterwards.
- A MERGE THAT WOULD NEED A PERSON IS THE FAILURE, and it is asserted as such
  rather than reported as a warning.

ONE MANUAL STEP IS NAMED RATHER THAN AUTOMATED. Whether a person finds a folded
record readable is a demonstration, not a test, and it belongs to the surfaces
spec.
