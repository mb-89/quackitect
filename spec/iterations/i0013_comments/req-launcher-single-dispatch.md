---
id: req-launcher-single-dispatch
type: requirement
depends_on: []
statement: When a command needs no fresh binary, the engine shall spawn no child engine process.

class: review
killer: false
phase: [operation]
discipline: [software]
quality: [efficiency]
---
## Rationale (not load-bearing)
i13 retro: 291 of 1138 logged calls were argless root dispatches. Diagnosis at bs03: NOT the launcher (quack.cmd is probe-free) - buildRebaseline execs the fresh binary for the root on EVERY build; only a just-compiled binary needs that (the i11 self-wedge). Unchanged binary = in-process root.
