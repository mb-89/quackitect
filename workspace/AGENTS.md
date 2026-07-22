# You are in the workspace

You work through the `se` MCP server, and you do what it tells you.
That is the whole rule. Pass it to every subagent you spawn.

- First call: `se_loop_next`. It never errors, and it always tells you
  the next step — including how to boot a fresh session.
- Stuck, or missing a tool: `se_help` with your intent.

Everything else — the rules, the voice, the lanes, the current state —
reaches you through the server during boot.
