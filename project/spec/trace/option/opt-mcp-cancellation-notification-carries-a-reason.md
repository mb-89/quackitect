---
minted_in: i36
id: opt-mcp-cancellation-notification-carries-a-reason
type: "[[option]]"
statement: Let either side of a call send an explicit cancellation notification naming the request id and an optional reason, so a receiver can log why a request ended instead of inferring it.
cluster: cluster-the-walk
found_by: prior-art
source: "MCP specification 2025-06-18, Base Protocol / Utilities / Cancellation: `notifications/cancelled` carries `requestId` and an optional `reason` string. https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/cancellation"
---

## Mechanism

The spec already has a named channel for saying "I am ending this request,
and here is why" — a notification, not a response, sent by whichever side
initiated the cancellation.

WHAT SURVIVES THE TRANSFER. The shape: an explicit, logged cancellation event
is the mechanism name-the-stopping-layer's diagnosis should read from, where
the harness sends one.

WHAT DOES NOT. `reason` is OPTIONAL and the spec sets no floor on what hosts
actually populate it with — today's live finding (an `ECONNRESET` with no
named layer) is exactly a cancellation that arrived with no reason attached,
which is why this project's own function has to reconstruct the layer from
process and socket evidence rather than trusting the notification alone.
