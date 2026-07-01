---
id: req-inside-launcher
type: requirement
refines: [uc-drive-from-inside]
statement: A bare workspace ships a committed launcher stub (`quack.cmd` at its root) that resolves an engine at runtime in a fixed order — env `QUACK_ENGINE`, then a gitignored local pointer (`.quack/engine.local`), then `PATH` — and forwards all arguments to it. No engine binary is committed into the workspace.
depends_on: [req-engine-loc-untracked]
class: review
killer: false
---
## Rationale (not load-bearing)
The entry surface for the human. Resolution order is deterministic and machine-local; the stub itself is committed, the engine it finds is not.
