---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server
type: "[[raid]]"
kind: assumption
statement: "A cloud agent session that has already started cannot register an MCP server into itself, so a cage placed after it began does not bind it and the lane must be reached another way."
owner: the owner
trigger: "the first agent harness that offers a live MCP attach to a running session"
status: open
impact: "The whole of Arrival A rests on this. If it is false, se-arrive's HTTP client half is a workaround for a solved problem, the caged-subagent pattern is unnecessary, and Arrival A collapses into Arrival B."
breaks_how_badly: annoying
how_likely: conceivable
probe: "UNPROBED as an assumption about harnesses in general, and that is the honest state. WHAT IS ESTABLISHED, measured 2026-08-17: on THIS harness the session began with no se_ tools, placing project/.mcp.json mid-session added none, and the lane became reachable only by starting it headless and calling /mcp over HTTP. That is one host, not a law. WHAT WOULD FALSIFY IT: any harness that reloads its MCP registry on demand."
probed: 2026-08-17
source_refs:
  - i35-the-cloud-run-s-findings-land-the-fix-fi
weighs_with: none
weighs_against: none
---

## Probe

ASK THE HARNESSES, not the code. This is a claim about hosts, and this
repository can only ever observe the one it is running on.

WHAT THIS BOX SHOWED. The session started as Arrival A describes: a
checkout, native tools, and no `se_` anything. Writing the cage into
`project/.mcp.json` mid-session changed nothing, because the registry was
read before the session existed. The lane became reachable only by running
it headless and speaking JSON-RPC to `/mcp` on the mirror port.

WHY IT MATTERS MORE THAN IT LOOKS. Two designs hang off it — the
caged-subagent hand-over in cloud-runner.md, and se-arrive's written
client. Both exist to route around this one limitation. If a host lifts it,
both become dead weight rather than merely redundant.
