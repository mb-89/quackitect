---
id: adr-mcp-transport
type: adr
kind: architecture
decided_in: i0018_mcp_apply
adjudicated_by: user
statement: The MCP server is HAND-ROLLED JSON-RPC over stdio on the standard library: newline-delimited framing, three methods (initialize, tools/list, tools/call), a pinned dated protocol version, all logging routed to stderr. Datum: the official modelcontextprotocol/go-sdk (candidate 1B). The SDK loses because it would be the engine's first runtime dependency, breaching the zero-dependency law the one-static-binary distribution model rests on, weight 1.0. The hand-roll is proven small, sebot at roughly 555 LOC, and quack's single-shot model already matches stdio shutdown. Reverse-sensitivity: the SDK wins only in a world where the protocol churns faster than we can track AND conformance bugs bite real clients. That is a recorded tripwire: watch the spec revisions; the SDK is the fallback if the M5 spike shows hand-rolling is unexpectedly hard.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
