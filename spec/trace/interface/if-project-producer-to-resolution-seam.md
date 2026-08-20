---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: if-project-producer-to-resolution-seam
type: "[[interface]]"
statement: The producer writes a record into the driven tree naming which copy drives it and at what version, and the resolution seam reads that record to decide whether the tree is a driven project at all.
source: el-project-producer
destination: el-resolution-seam
carries:
  - flow-driven-tree
form: file, written once into the produced tree and read on every arrival in it
bound: inherited for reading the record, which is one file read in the tree already in hand. NOT inherited for resolving the identity it names on a machine that has never seen the named copy — that is a lookup, it is unmeasured, and it is the cold-start cost no criterion in this iteration sees.
satisfies:
  - req-where-each-artifact-lands-when-driving
source_refs:
  - decompose-structure, the element matrix's owed cell
  - opt-the-tree-names-what-not-where
  - raid-dec-a-driven-tree-names-which-copy-drives-it
  - cluster-the-walk
---

## The one seam the iteration cut across the partition

`cluster-the-walk` NAMES THIS CROSSING AS THE ONE EVERY CANDIDATE HAD TO PLACE
SOMEWHERE. It is the only cross-cluster edge the iteration created, and it could
not be drawn until the producer had an element. It has one now.

## What crosses, and in which direction

ONE WAY ONLY. The producer writes; the seam reads. Nothing travels back, and
that is the isolation guarantee rather than an omission — a return path from a
driven tree to the thing that made it is exactly what
[[req-nothing-a-copy-does-reaches-its-source]] forbids.

THE TWO ENDS NEVER MEET IN TIME. The producer runs once, when the tree is made.
The seam runs on every arrival in that tree afterwards, possibly on another
machine, possibly years later. The contract is therefore the RECORD's format
rather than a call's shape.

## What the seam does with it

THREE ANSWERS, and the third is what the record exists for.

- A record that resolves: the seam names the copy's tree as the method source
  and the driven tree as the work target.
- A record naming a copy this machine has never seen: refuse, naming the
  identity rather than the absence.
- No record at all: this is not a driven project. Refuse, and name the record
  that was looked for.

## Why the format is the contract

THE RECORD NAMES AN IDENTITY AND A VERSION, NEVER A PATH. That is the whole
reason this interface is stable across a move, a copy and a clone of either
tree, and it is why the predecessor's location-keyed equivalent fails by
answering wrongly rather than absently.

WHAT AN IDENTITY IS HAS NOT BEEN DECIDED, and this contract cannot be built
until it is. A copy today is a folder with a name, and two people could produce
copies with the same name.

## The failure behavior an integrator needs

A MALFORMED RECORD IS NOT AN ABSENT ONE. Absent means not a driven project;
malformed means somebody wrote something the format does not admit, and it must
refuse loudly rather than fall through to the not-a-driven-project answer. The
two states have different remedies and merging them hides the second.
