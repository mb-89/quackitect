---
id: i4-m6-bs-workspace-base
statement: Workspace base selector: a --base/-C override + centralize state-path resolution behind the workspace root; default = cwd walk-up (unchanged). Realizes req-workspace-split.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-grandfather-designs]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
