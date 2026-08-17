---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.hand-over-the-means-to-call
type: "[[function]]"
cluster: the-arrival
statement: "give the agent a way to call the lane that needs nothing it does not already have"
satisfies:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
inputs:
  - flow-live-lane
outputs:
  - flow-arrival-account
---

## Rationale

An arriving agent has no `se_` tools and cannot get them, because the MCP registry was read before it existed. So a live lane it cannot call is not an arrival.

THIS FUNCTION IS THE CONTINGENT ONE. It exists because of raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server. Falsify that and this function disappears rather than changing.
