---
minted_in: i36
id: if-arrival-to-walk-engine
type: "[[interface]]"
statement: Arrival sends the connected harness identity and measured limits to the walk engine before it serves a governed step.
source: el-arrival
destination: el-walk-engine
carries:
  - flow-harness-profile
form: call
source_refs:
  - fn-arrive-on-a-machine.identify-the-harness
  - req-supported-harness-serves-one-lane-contract
---

The arrival element names the attached harness. The walk engine consumes that
profile to serve the lane within the host's declared limits.
