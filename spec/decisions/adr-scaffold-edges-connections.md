---
id: adr-scaffold-edges-connections
decided_in: i0020_cold_run_fixes
type: adr
adjudicated_by: human
statement: New workspaces default to connections mode at SCAFFOLD time. start init writes edges="connections" exactly as start stubs already does. The engine's global default stays frontmatter for legacy workspaces. compose-reference names JSONL connections as the lane for new work and frontmatter as the legacy lane pending migrate-edges.
class: review
killer: false
---
## Rationale (not load-bearing)
Flipping the engine's global default would silently switch legacy workspaces without an edges key into connections mode, where the strict parser refuses their frontmatter edge keys - a breaking change bought for nothing. Scaffold-time defaults give every NEW vehicle the intended lane (field failure: a fresh start init vehicle landed in the legacy frontmatter lane against the owner's intent) at zero risk to existing boards.
