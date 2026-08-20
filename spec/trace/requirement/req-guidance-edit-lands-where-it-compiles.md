---
minted_in: i1
id: req-guidance-edit-lands-where-it-compiles
type: "[[requirement]]"
statement: When a walk-governing source is edited through the lane, the engine shall land the write in the tree the walk compiles that source from.
kind: functional
verify_method: test
breaks_if_removed: The edit lands in a tree the walk never compiles from, the reload changes nothing, and the driver believes a correction took effect that did not.
breaks_how_badly: crippling
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 2
  - uc-change-the-method-mid-walk ext 2a
  - uc-change-the-method-mid-walk ext 2b
priority: must
---

## Detail

## Detail

| source class | the tree it compiles from |
| --- | --- |
| rigor-matrix rows and engine sources | the trunk |
| method cards read at state entry | the record's tree |

- A write that cannot land in the compiling tree is refused, naming that tree.

| vendored host | method content compiles from the overlay, and the write lands there |
