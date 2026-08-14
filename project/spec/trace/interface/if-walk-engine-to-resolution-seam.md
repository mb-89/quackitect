---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-walk-engine-to-resolution-seam
type: "[[interface]]"
statement: The walk engine hands every dispatched call to the seam before it reaches storage, and takes back the store it resolved to or the refusal that stopped it.
source: el-walk-engine
destination: el-resolution-seam
carries:
  - flow-dispatched-call
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-two-layer-auth
---

The seam moved out of the engine. This interface is what is left where it
used to be inline.

## What changed

Before, the dispatch point judged paths itself. Now it dispatches and the
seam judges, so the rule has one home whether the engine is running inside a
satellite or beside the core.

## The two-layer authorisation is unchanged

It is still judged at this crossing:
whether the verb may act at all, and whether it may act on this target.
