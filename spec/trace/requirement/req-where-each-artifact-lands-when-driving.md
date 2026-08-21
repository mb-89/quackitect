---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-where-each-artifact-lands-when-driving
type: "[[requirement]]"
statement: Where the system has been pointed at a product that is not its own, it shall resolve every artifact it reads or writes to the tree that owns that kind of artifact - work to the driven product, method to the system.
kind: functional
verify_method: test
breaks_if_removed: The system can only ever work on itself, which is the state it is in today, and every measurement it has of its own method is a measurement of it working on its own source.
breaks_how_badly: crippling
refines:
  - uc-drive-a-foreign-product
source_refs:
  - uc-drive-a-foreign-product step 1
  - uc-drive-a-foreign-product step 2
  - uc-drive-a-foreign-product step 5
  - uc-drive-a-foreign-product step 6
  - uc-drive-a-foreign-product ext 4a
  - uc-drive-a-foreign-product ext 6a
  - sty-drive-somebody-elses-product
  - stk-engineer-driving-agents
priority: must
---

## Detail

ONE CONCERN, FOUR FACETS: which tree each kind of artifact resolves to when
the work is not the system's own. They fail independently and they share one
verification method.

| facet | what binds |
| --- | --- |
| the work | When a walk on a driven product produces a record, an evidence file or a signature, that artifact shall resolve inside the driven product's tree. |
| the method | While driving, method artifacts shall resolve from the system's own tree with the copy's overlay above them, and never from the driven tree - whatever that tree happens to contain. |
| the machinery | When the system captures a note about its own machinery, that note shall resolve inside the system's tree, and the walk shall continue. |
| first contact | When first pointed at a product, the system shall report where that product's work stands and shall write zero files before a walk begins. |

## Why the second facet is not obvious

A DRIVEN PRODUCT MAY CARRY DOCUMENTS THAT LOOK LIKE METHOD - guidance, cards,
rows. They are that product's WORK. Reading them as method would let a driven
tree change how the system behaves, which is a different and much larger
capability than anybody asked for.

SO THE RULE IS ABOUT PROVENANCE RATHER THAN SHAPE. Where an artifact came from
decides what it is, never what it looks like.

## Why the third facet earns its own line

IT IS THE SIXTH GOAL MADE CHECKABLE. A copy driving somebody else's product
notices a fault in its own machinery, records it, and repairs it in its own
next iteration. The note landing in the wrong tree is the whole failure: it
would put the system's business in somebody else's repository, and it would be
lost to the system that has to act on it.

AND IT IS THE SHARPEST ASSERTION IN THE STORY BEHIND IT. One file existing in
one place and not another.

## What is not specified here

HOW A PRODUCT IS NAMED. Whether by path, by configuration or by a lane verb is
M4 and M5's to choose. This row says what must be true of the result, and
naming a mechanism here would freeze design as obligation.
