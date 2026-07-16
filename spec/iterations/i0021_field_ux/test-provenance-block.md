---
id: test-provenance-block
type: test
statement: A provenance block parses from node frontmatter into the per-field map. Changing one provenance line moves the node's full hash. Value and provenance travel under one identity.
class: executed
verify: selftest:provenance-block
killer: false
---
## Rationale (not load-bearing)
The substrate test for adr-provenance-in-node: the register's colors (test-register-colors)
and the mint justifications (req-mint-prefill.2) both stand on this parse+fold. Composed
mid-build when the walk found the substrate deserved its own red - the b3 step's slice.
