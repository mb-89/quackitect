---
id: req-cli-steer
type: requirement
statement: When a ledger command arrives over the bare CLI on the agent channel, the engine shall refuse it and point at the MCP tools.
class: review
killer: false
---
## Rationale (not load-bearing)
q-cli-steering ruled A (owner, 2026-07-14): block, do not merely steer. Agents
are pushed to the MCP lane. The console channel stays untouched.
