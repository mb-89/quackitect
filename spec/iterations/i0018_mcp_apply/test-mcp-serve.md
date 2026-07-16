---
id: test-mcp-serve
type: test
statement: The MCP server lists the command surface as tools over stdio. It answers a call with the command's structured result read fresh from the workspace. It refuses an unattested ledger-advancing call. It exits when its client closes the connection.
class: executed
verify: selftest:mcp-serve
killer: false
---
## Rationale (not load-bearing)
Arrives RED at M6; the selftest does not exist at compose time.
