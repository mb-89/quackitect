---
id: i3-m6-go-engine-core
statement: Engine core ported to Go: node model, load_all, norm, stmt_hash, full_hash merkle fold, suspect and bless, gate_state.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-parser]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-parser so the port proceeds in dependency order and survives interruption.
