---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.supply-the-dependencies
type: "[[function]]"
cluster: the-arrival
statement: "bring the project's dependencies to what it declares it needs"
satisfies:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
  - req-arriving-twice-changes-nothing
inputs:
  - flow-runtime-verdict
outputs:
  - flow-arrival-account
---

## Rationale

node_modules is not in git, so a fresh clone cannot start the lane. This is the least interesting function here, and it is listed because leaving it implicit is what makes an arrival a five-step ritual instead of one act.
