---
minted_in: i2-parallel-iterations-across-machines-seed
id: req-seed-lands-on-remote
type: "[[requirement]]"
statement: When an iteration is seeded, the engine shall push its stub to the remote in the same act, so every peer machine lists it from its next fetch.
kind: functional
verify_method: test
breaks_if_removed: Seeds stay local and a peer cannot see that work exists - the parallel pool is a fiction.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration trigger
priority: must
---
