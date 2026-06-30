---
id: i3-m6-build
statement: Build the design. The planned steps below realize it, in dependency order.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-parity-perf]
---

## Rationale (not load-bearing)
Generic build parent for milestone M6, seeded by the plan-build step. The planned build steps are
its children (parent: i3-m6-build) and chain in dependency order; this gate rolls up when the last
step is done. Verification runs after build.
