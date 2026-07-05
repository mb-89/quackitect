---
id: cand-register-vale
type: candidate
axis: register-lint
ratings:
  zero-dep: 0.7
  authoring-cost: 0.9
statement: Vale, auto-pulled once, run as a subprocess, never linked.
class: review
killer: false
---
Pro: industry-grade rules, zero maintenance of ours. Con: a soft runtime dependency; first use needs the network once; degradation is graceful and LOUD. (Backfilled from M3-candidates.md, axis 7.)
