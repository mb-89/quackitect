---
minted_in: i1
id: req-trees-never-mix
type: "[[requirement]]"
statement: While a vehicle runs the engine, the engine shall land zero writes inside the vehicle's overlay tree and zero overlay content inside its own tree.
kind: quality
verify_method: test
breaks_if_removed: The private overlay leaks into the open engine, and the customer's reason to use the product dies.
breaks_how_badly: fatal
refines:
  - uc-quality-flexibility
source_refs:
  - uc-quality-flexibility step 4
  - uc-quality-flexibility ext 4a
  - stk-vehicle-owner
priority: must
---

## Scenario

- source: the engine and the overlay, writing during normal operation
- stimulus: any write lands during a walk
- artifact: the two trees: engine-owned and vehicle-owned
- environment: a vehicle project with a private overlay layered on the open engine
- response: every write lands in its owner's tree, and a cross-tree write is refused
- response measure: engine writes inside the overlay tree = 0; overlay content inside the engine tree = 0
