---
id: i5-m6-bs-emit
statement: Emit the stub set (launcher + AGENTS.md + .gitignore) into a target workspace via the engine's scaffold path, so a bare workspace can be made drivable-from-inside with one step. Realizes req-drive-from-inside (the emit half).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-bs-stub-templates]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Wires the three templates into a target workspace.
