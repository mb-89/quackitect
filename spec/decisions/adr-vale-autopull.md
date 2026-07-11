---
id: adr-vale-autopull
decided_in: i0012_spec_book
type: adr
kind: architecture
adjudicated_by: human
statement: The register lane runs Vale, auto-pulled once per OS into the data home and run as a subprocess - never linked, never hand-rolled. When the pull fails or the binary is missing, the engine prints a loud warning that the prose linter is absent and prose quality is likely to suffer; the advisory lane stays empty.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner-ruled: maintaining a prose linter is rejected; a single static MIT Go binary with graceful loud degradation keeps the engine zero-dep in the linking sense. First soft runtime dependency, declared in dependencies.md.
