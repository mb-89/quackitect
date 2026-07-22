---
id: se.q-mcp-transport
kind: question
statement: "Re-derive under v2 ground: MCP transport SDK-vs-hand-rolled — by the decision-timing principle, decided at implementation time with implementation data. DECIDED AT B2: hand-rolled; see se.adr-mcp-transport-v2."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-mcp-transport
v1_statement: "The MCP server is HAND-ROLLED JSON-RPC over stdio on the standard library: newline-delimited framing, three methods (initialize, tools/list, tools/call), a pinned dated protocol version, all logging routed to stderr. Datum: the official modelcontextprotocol/go-sdk (candidate 1B). The SDK loses because it would be the engine's first runtime dependency, breaching the zero-dependency law the one-static-binary distribution model rests on, weight 1.0. The hand-roll is proven small, sebot at roughly 555 LOC, and quack's single-shot model already matches stdio shutdown. Reverse-sensitivity: the SDK wins only in a world where the protocol churns faster than we can track AND conformance bugs bite real clients. That is a recorded tripwire: watch the spec revisions; the SDK is the fallback if the M5 spike shows hand-rolling is unexpectedly hard."
status: open
---

## The ported question

MCP transport SDK-vs-hand-rolled — by the decision-timing principle, decided at implementation time with implementation data. DECIDED AT B2: hand-rolled; see se.adr-mcp-transport-v2.

## v1 ruling (NOT ported — context only)

The MCP server is HAND-ROLLED JSON-RPC over stdio on the standard library: newline-delimited framing, three methods (initialize, tools/list, tools/call), a pinned dated protocol version, all logging routed to stderr. Datum: the official modelcontextprotocol/go-sdk (candidate 1B). The SDK loses because it would be the engine's first runtime dependency, breaching the zero-dependency law the one-static-binary distribution model rests on, weight 1.0. The hand-roll is proven small, sebot at roughly 555 LOC, and quack's single-shot model already matches stdio shutdown. Reverse-sensitivity: the SDK wins only in a world where the protocol churns faster than we can track AND conformance bugs bite real clients. That is a recorded tripwire: watch the spec revisions; the SDK is the fallback if the M5 spike shows hand-rolling is unexpectedly hard.
