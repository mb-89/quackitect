---
minted_in: i36
id: fn-arrive-on-a-machine.identify-the-harness
type: "[[function]]"
cluster: the-arrival
statement: identify which harness is carrying this session and profile its measured limits
satisfies:
  - req-supported-harness-serves-one-lane-contract
inputs:
  - flow-arrival-request
outputs:
  - flow-harness-profile
---

## Rationale

Every other arrival function assumes the harness is already known: which
config file to place, which client shim to write. Nothing upstream of them
actually names it.

Serving a lane contract sized to Claude Code, GitHub Copilot CLI, VS Code
agent mode, Codex and Cursor alike requires knowing which one answered,
before the first instruction or tool description goes out. That is a
distinct thing the system must do, not a detail of raising the lane or
placing the cage.
