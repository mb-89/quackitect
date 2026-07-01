---
id: uc-drive-from-inside
type: usecase
refines: [need-workspace-drive]
statement: A user opens a BARE workspace (product+spec+state, no engine present) on its own and drives it from INSIDE its own folder with `.\quack …`, via an engine linked at runtime — without copying the engine in and without committing the engine's location.
class: review
killer: false
---
## Rationale (not load-bearing)
i0005. Complements uc-drive-other-workspace (drive from OUTSIDE via --base) and uc-self-workspace (the engine's own checkout). Here the workspace has no engine of its own; it reaches one through a committed, path-free stub.
