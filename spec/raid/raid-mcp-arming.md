---
id: raid-mcp-arming
type: raid
kind: issue
probability: 1.0
impact: 0.3
mitigation: Next session, in order. One, confirm the quack MCP tools loaded (the approval is committed). Two, only then set agent_lane = "mcp" in spec/project.toml. Arming before the tools load would strand the agent (raid-over-blocking names the escape lanes).
owner: the driving agent
status: open
statement: The MCP lane is built but not armed. The fresh-session demo (tools loading, then agent_lane set) is still owed.
class: review
killer: false
provenance:
  class: schema-default (review)
  impact: agent-proposed at i22 M7
  killer: schema-default (false)
  kind: agent-proposed at i22 M7
  mitigation: agent-proposed at i22 M7
  owner: agent-proposed at i22 M7
  probability: agent-proposed at i22 M7
  status: schema-default (open)
---
## Rationale (not load-bearing)
The harness loads a project MCP server only at session start. This walk committed
the approval and built the block behind the declaration (adr-mcp-lane-declared).
The gap is a session boundary, not missing work.
