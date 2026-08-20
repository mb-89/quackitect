---
minted_in: i36
id: raid-mcp-stop-is-not-diagnosable
type: "[[raid]]"
kind: issue
statement: An interrupted lane call does not reveal whether the MCP server, transport, host or stop hook ended it.
owner: the driving agent
trigger: every cancelled lane call and every MCP server restart
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: Recovery begins without knowing which layer failed. The same interruption can therefore repeat without a targeted fix.
source_refs:
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/scope-non-goals.md
---

## Finding

A pull was cancelled during i36.

The owner observed that the MCP server seemed to stop.

The next pull returned normally.

## Need

The lane must distinguish these outcomes:

- server process loss
- transport interruption
- host cancellation
- stop-hook action

The result should say whether the server restarted.
