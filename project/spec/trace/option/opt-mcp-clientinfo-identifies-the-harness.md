---
minted_in: i36
id: opt-mcp-clientinfo-identifies-the-harness
type: "[[option]]"
statement: Read the connecting client's declared name and version from the protocol handshake to know which harness is attached, rather than guessing from behaviour.
cluster: cluster-the-arrival
found_by: prior-art
source: "MCP specification 2025-06-18, Base Protocol / Lifecycle, Initialization: the client's `initialize` request carries `clientInfo: {name, title, version}`, and the server responds with its own `serverInfo` the same way. https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle"
---

## Mechanism

The MCP lifecycle's initialize handshake is a NAMED identity exchange, not an
inferred one: the client states who it is before any tool call happens, and
the server can read that field directly rather than fingerprinting behaviour.

WHAT SURVIVES THE TRANSFER. The name-yourself-first shape: identify-the-harness
can read a declared identity at arrival time rather than waiting for a
distinguishing failure to reveal which host is connected.

WHAT DOES NOT. The spec does not mandate what a HOST does with that identity
once read, and it does not size served payloads to it — that half is this
project's own addition, because the standard stops at "know who you are
talking to" and leaves "serve them accordingly" unaddressed.
