---
id: se.context
kind: context
statement: "The SE machine's boundary: engine + MCP surface + board + ledger inside; harness, Obsidian, git, owner channels and module imports as neighbours."
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
---

## Boundary

Inside: the engine (dispatch, loop, gates, lanes, toll, call log), the MCP server surface (se_* tools), the board (localhost:7346), the ledger (spec/ledger - nodes, machines as canvases), the iteration spine (spec/iterations). Outside, as named neighbours with interfaces:
- the harness (Claude Code) | MCP stdio - the only way agents reach the system
- Obsidian + Advanced Canvas | the drawing medium; the compiler reads the canvas files at load
- git | the durability layer; se_git is the allowlisted interface; push stays with the owner
- the owner | channels: board (bless/dismiss), chat relay (se_gate_bless), console (bin/se-gate), phone (planned)
- module imports (kb, ../benjamin) | read-only content served through the se surface, stamped at gate time
- the research-agent scorer | spawned per evaluate-class state; reads prior art and external tools, returns one absolute score row, holds no state
- the machine-local state dir (~/.se/<project>) | offers, notes inbox, call log, toll - never committed

## Intended use
One owner drives one project's iterations through agent sessions: the drawn machines hand out work packets, gates collect one human bless per milestone, and the record (ledger + evidence + call log) stays complete enough that any fresh session or future retro can reconstruct what happened and why.

## Excluded use (binding)
- multi-project orchestration in one instance (one project root per server)
- multi-owner or delegated-committee adjudication (one adjudicating owner; roles, not names)
- drawing formats beyond the pinned Advanced Canvas version (the compiler refuses, never guesses)
- general CI/CD, deployment or hosting duties
- secrets management of any kind
- replacing git as the durability layer
- serving as a general-purpose agent framework outside the iteration process
