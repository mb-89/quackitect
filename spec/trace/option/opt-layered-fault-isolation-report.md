---
minted_in: i36
id: opt-layered-fault-isolation-report
type: "[[option]]"
statement: Report a fault by naming which layer of a known stack absorbed it (physical, transport, session, application), rather than one flat "it failed".
cluster: cluster-the-walk
found_by: analogy
source: "Network fault isolation's layered diagnosis (OSI-style): tools such as traceroute and link-state monitoring report which hop or layer lost the packet, rather than only 'unreachable'. Standard networking troubleshooting practice."
---

## Mechanism

Abstracted one level: telling apart several possible causes of one observed
failure, when each cause sits at a different layer of the same stack.

Network troubleshooting answers this by walking the stack explicitly:
physical link, then transport, then session, each checked in turn, so the
report names the layer that actually broke rather than a single undifferentiated
"the connection failed".

WHAT SURVIVES THE TRANSFER. The shape: name-the-stopping-layer reports one
of a fixed, known set of layers (process, transport, host, stop hook)
rather than a flat "the call did not return", exactly as a layered network
report does.

WHAT DOES NOT. Network layers are ordered and a fault at a lower layer
implies the ones above it also failed. This project's four candidate
layers are not ordered that way — a stop-hook action and a transport loss
are siblings, not a stack, so the diagnosis cannot walk them in a fixed
sequence the way a network trace walks hops.
