---
id: req-build-fast-path
type: requirement
depends_on: []
statement: When no engine source changed since the last build, quack build shall skip the compile and re-baseline within one second on the reference machine.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [efficiency]
---
## Rationale (not load-bearing)
i12: 149 build calls, 119 over 2s - most were content-only. The trip-wire semantics stay; the cost collapses.
