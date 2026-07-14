---
id: req-selftest-tiers
type: requirement
statement: Where the build fast-path runs, quack build shall execute a fast selftest tier only, and quack selftest shall keep running the full battery - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Where the build fast-path runs, quack build shall execute only the fast selftest tier.
2. The quack selftest command shall run the full battery unchanged.

## Rationale (not load-bearing)
Retro measure (NOTE-20260713-210402): selftest ran slow (>2s) in 39 of 59 calls - the battery is
300+ cases, several spawning stub workspaces, and it rides every build. The responsiveness guide
sets the 1-second bound. Tier membership is data, not judgment: the fast core is the set that
touches the build's own invariants (parity, golden root, parser).
