---
minted_in: i1
id: nbr-agent-harness
type: "[[neighbour]]"
statement: The AI agent harness that drives the walk across supported hosts.
direction: in
group: supported-products
---

## Interface

The `se` MCP server is the primary boundary.

The harness calls `se_pull` and the lane tools.

Every call is logged raw.

The harness also controls limits outside the server:

- tool-description size
- aggregate tool count
- instruction-file size
- result offload
- cancellation
- hook delivery

The cage is part of the interface.

Each host reads its cage from a different configuration surface.

The lane must report the active harness and distinguish these endings:

- server process loss
- transport interruption
- host cancellation
- stop-hook action
