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

Per the structure rule: spec is the thinking, product is what ships.

- `spec/` — ledger (markdown nodes), iterations (state + evidence + grants), bootstrap log
- `product/` — engine, bin, modules, tests, brand
- `.se/` — machine-local: call log, toll, live offer (never committed)
