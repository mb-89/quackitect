---
id: need-workspace-drive
type: need
statement: One engine drives many projects. A project's product, spec, and all its state live in a selectable WORKSPACE; the engine (binary + resources) is separate and can point at its own workspace or a different project's, the way a tool operates on a target repo.
class: judgment
killer: true
---
## Rationale (not load-bearing)
quack and vehicles are themselves projects (they have product+spec) but must also drive OTHER projects. Today the engine is bound to its own ROOT, so driving another project means vendoring a whole engine into it. Separating the workspace (data) from the engine lets one engine serve many workspaces. Builds on i3's need-engine-reuse.
