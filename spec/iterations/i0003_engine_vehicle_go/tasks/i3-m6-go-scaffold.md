---
id: i3-m6-go-scaffold
statement: Go module scaffold and build setup. A quack entrypoint compiles to one static binary and cross-compiles.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-build-planned]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-build-planned so the port proceeds in dependency order and survives interruption.
