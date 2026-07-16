---
id: req-mcp-reload
type: requirement
statement: When the build stamp moves, the running MCP server shall adopt the staged binary.
---
## Statements
1. When the build stamp moves, the running MCP server shall adopt the staged binary.
2. When the tool surface changes, the server shall emit a list_changed notification.
3. If an in-flight request is open, then the swap shall wait for its reply.

The server becomes a thin supervisor over a child engine process. Whether the harness
acts on the notification is probed at M5. The emit is correct per MCP spec either way.
