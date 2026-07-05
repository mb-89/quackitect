---
id: req-inside-launcher
type: requirement
refines: [uc-drive-from-inside]
statement: The bare workspace's committed launcher stub (`quack.cmd` at its root) shall resolve an engine at runtime in a fixed order - the global engine binary, then env `QUACK_ENGINE` - and forward all arguments to it. No engine binary or engine path is committed into the workspace.
depends_on: [req-engine-loc-untracked]
class: review
killer: false
---
## Rationale (not load-bearing)
The entry surface for the human. Resolution order is deterministic and machine-local; the stub itself is committed, the engine it finds is not. Restated at i11: the internal `.quack\engine` and `.quack/engine.local` pointer lanes retired (adr-retire-legacy-lanes).
