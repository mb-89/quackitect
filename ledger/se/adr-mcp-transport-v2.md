---
id: se.adr-mcp-transport-v2
kind: decision
statement: MCP transport is hand-rolled stdio JSON-RPC; the SDK is rejected while the engine stays zero-runtime-deps.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: agent
  channel: bootstrap-session
  source: B2, decision-timing principle
options:
  - hand-rolled stdio JSON-RPC
  - "@modelcontextprotocol/sdk"
criteria:
  - supply-chain surface
  - protocol-drift risk
  - custom dispatch (toll, refusals)
  - implementation cost
datum: "@modelcontextprotocol/sdk"
sensitivity: winner robust — flips only if the protocol surface grows past tools/list+tools/call
as_offered: bless-with-changes-pending-owner-review
---

## Rationale

Decided at B2 with implementation data, per the decision-timing principle (the v1 adr-mcp-transport question was deliberately left open for exactly this moment).

Grounds: the needed subset is thin (initialize, tools/list, tools/call, ping over line-delimited JSON); the engine has zero runtime dependencies and the SDK adds zod plus transitive churn; the toll and refusal-first dispatch need custom middleware regardless; contract tests speak real bytes to a spawned server and carry the protocol-drift risk.

Wire names use underscores (se_get_node) — the Anthropic API rejects dots in tool names; the dotted form rides titles.

## Consequences

Protocol drift is ours to track. The contract test suite is the tripwire; revisit if the surface needs resources, prompts, or streaming.
