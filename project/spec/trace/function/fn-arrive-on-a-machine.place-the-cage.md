---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.place-the-cage
type: "[[function]]"
cluster: the-arrival
statement: put the deny list and the lane config where the host reads them
satisfies:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
  - req-native-project-tools-stay-outside-the-cage
inputs:
  - flow-arrival-request
outputs:
  - flow-placed-cage
---

## Rationale

The cage and the lane config are gitignored on purpose, so a fresh clone has neither. An agent that skips this is not caged at all, and nothing about its behaviour would say so.

THE FAILURE DIRECTION THAT MATTERS is a cage that denies too little: the agent simply holds a native tool, and every call it makes looks legal.
