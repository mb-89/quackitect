---
id: need-workspace-drive
type: need
statement: One reusable, dependency-free engine drives many projects. A project's product, spec, and all its state live in a selectable WORKSPACE; the engine (binary + resources) is separate and can point at its own workspace or a different project's, the way a tool operates on a target repo. Other projects vendor and overlay the engine without forking, running it as a self-contained artifact with no runtime or web-downloaded dependencies.
class: judgment
killer: true
---
## Rationale (not load-bearing)
i0006 consolidation: absorbs the former need-engine-reuse (reusable, dependency-free, vendor/overlay engine) into workspace-drive. quack and vehicles are themselves projects (product+spec) but must also drive OTHER projects; separating the workspace (data) from the engine lets one engine serve many workspaces, and the vendor/overlay chain lets other projects reuse it without forking. Use-cases: uc-self-workspace, uc-drive-other-workspace, uc-drive-from-inside, uc-ship-branded-engine, uc-review-board, uc-run-dep-free, uc-vendor-engine.
