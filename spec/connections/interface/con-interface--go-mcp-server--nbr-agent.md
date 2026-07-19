---
id: con-interface--go-mcp-server--nbr-agent
type: connection
kind: interface
src: go-mcp-server
dst: nbr-agent
statement: The agent lane: commands and results over stdio MCP, gated by the session key.
class: review
killer: false
---
Neighbour: the AI agent's harness. What flows: tool calls carrying quack commands inward, structured results and refusals outward; ledger-advancing calls carry the attested session key. Direction: in (the agent drives, the engine answers). Channel: newline-delimited JSON-RPC over stdio - the MCP supervisor face - with the CLI (`argv` plus `--key`) as the equivalent fallback lane.
