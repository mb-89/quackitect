---
id: q-mcp-transport
type: question
state: decided
decided_via: owner ruling at i18-m4-gate - HAND-ROLLED JSON-RPC over stdio (adr-mcp-transport). The zero-dep law is a boolean invariant the one-static-binary distribution rests on; the conformance work is bounded (~200 LOC, sebot-proven), the SDK's dependency tree is not. SDK kept as the reversed-sensitivity fallback.
statement: Does the MCP server hand-roll JSON-RPC over stdio inside the zero-dependency engine, or adopt an MCP SDK as the engine's first runtime dependency? The zero-dep law collides with protocol conformance and maintenance surface. The owner rules at M3/M4.
class: review
killer: false
---
## Rationale (not load-bearing)
The Go rewrite decision made the engine zero-dependency by law. An MCP server without an SDK means hand-rolling JSON-RPC framing, the initialize handshake, and the tools surface against a moving protocol spec. An SDK buys conformance and costs the law. Undecidable at compose time; M3 elaborates both candidates and the owner decides at M4.
