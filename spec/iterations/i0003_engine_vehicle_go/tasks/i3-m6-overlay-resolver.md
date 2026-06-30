---
id: i3-m6-overlay-resolver
statement: One vehicle-to-engine overlay resolver; the command surface, guides, report shell, and gather route through it; the engine stays read-only.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-trace-filter]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-trace-filter so the port proceeds in dependency order and survives interruption.
