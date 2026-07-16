---
id: req-mcp-birth
type: requirement
statement: When scaffolding a workspace, the engine shall arm the MCP lane from birth.
---
## Statements
1. When scaffolding a workspace, the engine shall emit .mcp.json with an explicit launcher path.
2. When scaffolding a workspace, the engine shall set agent_lane to mcp.

Covers start init and start stubs. A bare launcher name breaks under NoDefaultCurrentDirectoryInExePath.
