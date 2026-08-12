---
minted_in: i2-parallel-iterations-across-machines-seed
id: req-claim-wears-its-age
type: "[[requirement]]"
statement: The claimable listing shall show, for every iteration, its claim state, the claiming machine id, and the claim's age.
kind: functional
verify_method: test
breaks_if_removed: Abandonment cannot be judged - a person deciding whether to force a release has nothing to decide from.
breaks_how_badly: corrosive
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration step 1
  - uc-claim-an-iteration extension 5a
priority: must
---
