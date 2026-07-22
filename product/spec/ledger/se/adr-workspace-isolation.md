---
id: se.adr-workspace-isolation
kind: decision
statement: "Agents run in workspace/ and reach the project only through the MCP server: ledger via se.set.apply, realization via se.deliverable, git via se.git. The repo root shows five entries; machine-local state lives in the user profile."
provenance:
  adjudicated_by: owner
  channel: chat-session
  iteration: post-b6
  ai_involvement: owner-ruled-agent-transcribed
breaks_if_removed: agents see the ledger and the deliverable directly and are no longer forced through the MCP server; the call log stops being the complete record of agent work
---

## Ruling (owner, 2026-07-22)

Layout: root = README, RUNME, workspace/, product/. workspace/ holds
AGENTS.md, the MCP link (.mcp.json) and deny rules - agents start and
stay there. product/spec/ holds the ledger and iterations, MCP-only.
product/deliverable/ holds the engine and future realization kinds,
reached through the se.deliverable lane (list/read/patch/write, CAS).
Git rides se.git, allowlisted; push refused (se.rule-owner-pushes).
Machine-local state (call log, toll, offer) lives under the user
profile (~/.se/<project>), never in the repo.

## Named residual

Subprocesses are porous (design 14: careless-agent threat model).
Belts: deny rules in workspace settings, AGENTS.md rule incl.
subagents, everything-logged dispatch. Physical isolation of the
ledger arrives with the i2 worktree layer.

## Naming

deliverable, not code: code is one realization kind among several
(CAD, drawings, procedures may follow). RUNME means run me: it starts
an agent in the workspace; verification lives in npm run verify.
