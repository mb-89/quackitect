---
id: uc-mcp-drive
type: usecase
statement: An external program drives quack over MCP - each command a tool call with a structured result, no shell quoting or encoding seam, one resident server per client session.
class: review
killer: false
---
## Rationale (not load-bearing)
The owner lead NOTE-20260710-214719: the per-call launch tax and the shell seams fall away structurally when the harness holds the commands as first-class tools.
