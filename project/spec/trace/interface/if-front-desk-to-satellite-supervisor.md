---
minted_in: i27
id: if-front-desk-to-satellite-supervisor
type: "[[interface]]"
statement: Entering a record from the desk asks the supervisor to raise its satellite, and the desk gets back either a serving satellite or the reason there is none.
source: el-front-desk
destination: el-satellite-supervisor
carries:
  - flow-open-record
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
---

Entering a record is now a start. This is where that becomes visible to a
person.

## What comes back

One of two, and never a third.

- A SERVING SATELLITE, levelled and composed, ready for the first call.
- A REFUSAL naming why: the claim is held elsewhere, the tree would not level,
  or the record's delta no longer applies to trunk.

## The refusal is the point

Entry is where a stale delta or an unlevellable
tree is caught, and the person is standing right there when it happens rather
than discovering it mid-walk.

## What the desk never does

It never walks the record. It asks for the satellite and
routes the person to it; the walk begins on their next pull.
