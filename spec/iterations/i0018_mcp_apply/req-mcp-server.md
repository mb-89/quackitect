---
id: req-mcp-server
type: requirement
depends_on: []
statement: The engine shall serve the command surface as MCP tools over standard input and output - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a client starts the MCP serve command, the engine shall expose the command surface as MCP tools over standard input and output, answering each call with the command's structured result.
2. The engine shall evaluate every MCP tool call against the workspace state read at call time.
3. While an MCP session holds no attestation, the engine shall refuse a ledger-advancing tool call under the same attest rules as the agent's command-line channel.
4. When the client connection closes, the MCP server shall exit.
5. If a newer engine build is staged while the server runs, then the server shall not answer a later tool call from the superseded binary.
6. If a tool call fails, then the engine shall return the failure as a structured error result, and shall not break the transport.
