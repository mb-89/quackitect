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

## What i51 adds, 2026-08-21

THE CANCELLATION LIMIT IS THE ONE CROSSING THIS ITERATION TURNS ON, and it was
listed above without its consequence.

The harness decides how long it waits for a lane call. We do not set that
number and cannot read it. When it expires the harness reports a failure to
the agent, and the lane never hears about it.

SO A LONG ANSWER IS NOT SLOW, IT IS WRONG. Measured once: two calls expired at
this boundary, and one of them had ALREADY LANDED. The agent was told its work
failed while the work had moved.

THAT IS WHY A DEFERRED VERDICT IS A BOUNDARY CONCERN RATHER THAN A COMFORT.
Answering at once and handing the verdict back later is how a call stays
inside a limit somebody else owns.

THE ENGINE'S OWN NUMBERS SIT EITHER SIDE OF IT. A condition script may run for
600,000 ms (deliverable/engine/sessionscript.ts line 87), and the pull that
started it is awaited inline (deliverable/engine/session.ts line 3686). No
harness waits that long.
