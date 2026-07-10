---
id: crit-zero-dep
type: criterion
metric: lines of protocol code beyond net/http
statement: The axis weighs how much hand-rolled protocol code the candidate forces into the stdlib-only engine.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.9 (M3, derived from req-adapter-zero-dep). Scale anchors - 1.0: plain net/http calls; 0.4: a hand-rolled protocol client (websocket framing); 0.0: needs a third-party module.
