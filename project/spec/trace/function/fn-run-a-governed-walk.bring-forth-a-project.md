---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: fn-run-a-governed-walk.bring-forth-a-project
type: "[[function]]"
cluster: the-bootstrap
statement: produce a tree for work that is not the system's own, and record in it what it must follow back to find its method
satisfies:
  - req-the-system-runs-in-a-tree-that-is-not-its-own
  - req-an-act-writes-only-the-tree-it-produced
  - req-where-each-artifact-lands-when-driving
inputs:
  - flow-intent
  - flow-repository
outputs:
  - flow-driven-tree
  - flow-scaffolded-product
controls:
  - the direction of writes, which bounds the act to the tree it is producing
  - which copy is recorded as the one to follow back
source_refs:
  - uc-drive-a-foreign-product step 1
  - uc-drive-a-foreign-product ext 1z
  - uc-drive-a-foreign-product ext 2y
  - "product/engine-go/i18_red3.go at ref main"
---

## Rationale

IT IS A SIBLING OF `bring-forth-a-copy` AND NOT THE SAME FUNCTION, and the two
were nearly folded. THE TEST THAT SEPARATED THEM IS WHAT COMES OUT.

- `bring-forth-a-copy` produces A COPY OF THE SYSTEM. Everything the system
  needs, under a new name, able to run alone.
- THIS produces A PLACE FOR WORK. It carries none of the system's method, and
  it is useless without the pointer this function writes into it.

TWO FUNCTIONS PRODUCING DIFFERENT THINGS ARE TWO FUNCTIONS, whatever they share
in how they are reached. What they DO share is the bound: both write inside the
tree they are producing and nowhere else, which is why
[[req-an-act-writes-only-the-tree-it-produced]] is satisfied by both.

## The pointer is the whole function

WITHOUT IT THE TREE IS A FOLDER. `req-the-system-runs-in-a-tree-that-is-not-its-own`
demands that the system come up in a tree carrying none of its method, and the
only way it can is by following something recorded at the moment the tree was
made.

SO RECORDING IT IS PART OF PRODUCING, not a later step. A tree produced without
the pointer is a tree the system cannot come up in, which is the same as not
having produced anything.

AND v1 PUT IT EXACTLY THERE. Its `start stubs` writes `engine-home.txt` naming
the vehicle, and its test asserts that file's content before asserting anything
else works. See note-b966f8fd311e.

## Why `stand-up-a-product` does not hold this

THAT FUNCTION TAKES A COMPUTER WITH NOTHING ON IT to a product that is running.
Its subject is the receiving MACHINE: install the toolchain, scaffold, stop
before a partial install.

THIS ACTS FROM AN EXISTING COPY and produces a tree elsewhere. Nothing about it
is an install, and the machine already has everything.

THEY MEET AT `flow-scaffolded-product`, which both produce. That is a shared
output rather than a shared function, and it is how the structure records that
a project can arrive two ways.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? At least four could, and
they differ in where the pointer lives - which is the open question M4 owns.

- The pointer inside the produced tree, in a file the work's own history
  carries.
- The pointer in a per-workspace data home outside both trees, which is v1's
  answer and which this product's path jail refuses.
- The pointer held by the copy instead, as a list of what it drives.
- No pointer at all, with the copy named each time the system starts there.

ALL FOUR SATISFY PRODUCE AND RECORD, and they are not the same design. The
last one is the one worth keeping in the space precisely because it questions
the word "record".

NO TECHNOLOGY IS NAMED. The statement says produce a tree and record what it
must follow back. It does not say file, config, database or environment.
