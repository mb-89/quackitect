---
id: req-mcp-discoverable
type: requirement
statement: When a harness session opens this workspace, the engine shall offer every command as a discoverable MCP tool.
class: review
killer: false
---
## Rationale (not load-bearing)
quack mcp shipped in i18, yet the agent still drives the CLI
(NOTE-20260714-152053). The gap is the wiring. M2 probes the real channel.
