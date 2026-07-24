---
id: se.req-hot-reload
kind: requirement
statement: When engine sources change on disk in development mode, the running MCP server shall serve the new behavior on the next call without an owner reconnect.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Every engine edit stalls on the owner's /mcp reconnect ritual; unattended engine work is impossible.
req_kind: functional
verify_method: demonstration
source_refs:
  - se.uc-3
---


