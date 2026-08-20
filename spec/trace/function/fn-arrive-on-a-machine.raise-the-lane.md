---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.raise-the-lane
type: "[[function]]"
cluster: the-arrival
statement: bring a lane up that an already-running agent can attach to, or reuse one standing
satisfies:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
  - req-arriving-twice-changes-nothing
inputs:
  - flow-placed-cage
outputs:
  - flow-live-lane
---

## Rationale

An agent that already exists cannot be launched into a lane, so the lane must be brought up beside it and attached to. That is the whole reason this is separate from se-start's own start step, which spawns a lane and then launches an agent into it.

REUSING ONE THAT STANDS is part of the same function: two lanes over one call log is a corrupted record rather than a slow one.
