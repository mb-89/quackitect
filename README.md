# quackitect v2

SE — Systematic Engineering. A process layer over a git repository: a ledger of
design decisions, a process by which decisions enter it, and mediated agent
access to it.

This is the v2 branch (orphan, same repo). v1 stays runnable on `main` until
UC-4 passes. The design source of truth during bootstrap is
`se-v2-design.md` (owner's working folder); it routes into this ledger at the
B3 mint and stops being authoritative then.

## Run

Windows: `.\RUNME.ps1` · POSIX: `./RUNME.sh`

RUNME starts an agent in `workspace/`. Setup runs only when missing.
Needs the sibling checkout `../benjamin` (live kb import).
CI check: `npm run verify` inside `product/deliverable`.

## Layout

- `workspace/` — agent territory. AGENTS.md, the MCP link, deny rules.
  Agents start here and reach the project only through the se server.
- `product/spec/` — the thinking: ledger, iterations (state + evidence +
  grants), bootstrap log. MCP-only.
- `product/deliverable/` — what ships: engine, bin, modules, tests, brand.
  Reached through the se.deliverable lane.
- `~/.se/<project>/` — machine-local: call log, toll, live offer.
