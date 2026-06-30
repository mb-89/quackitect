---
id: i3-m6-parity-perf
statement: Golden parity suite over the real spec and rendered report plus a perf harness; writes the evidence markers and the built binary, turning the executed tests green.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-deps-prompt]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-deps-prompt so the port proceeds in dependency order and survives interruption.
