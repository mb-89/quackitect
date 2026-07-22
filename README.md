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

Needs the sibling checkout `../benjamin` (private repo, live kb import).

## Layout

- `engine/` — the SE engine (TypeScript, run natively by Node >= 22)
- `modules/se/` — the se module declaration
- `ledger/` — the ledger (markdown nodes; minted at B3 from v1)
- `tests/` — node:test suites, including CI guards and git-layer fixture tests
- `bootstrap/` — the B0–B6 session log
