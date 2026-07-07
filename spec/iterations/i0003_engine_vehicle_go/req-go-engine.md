---
id: req-go-engine
type: requirement
statement: The engine is a single statically-linked Go binary. It has zero runtime dependencies. It performs no web download at run time. It builds with the Go toolchain and cross-compiles to Windows, macOS, and Linux from one machine.
depends_on: []
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2 killer. The distribution property that motivates the rewrite. Nothing fetched, nothing to install, runs from an unzipped folder. See adr-go-language.
