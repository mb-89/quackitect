---
minted_in: i2-parallel-iterations-across-machines-seed
id: req-claim-race-first-push-wins
type: "[[requirement]]"
statement: If two machines push a claim for the same iteration, then exactly one push shall be accepted; the losing machine shall re-fetch, mark the iteration taken, and offer the next unclaimed one.
kind: functional
verify_method: test
breaks_if_removed: Two machines hold the same iteration and duplicate a day of work - the exact collision the claim exists to prevent.
breaks_how_badly: fatal
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration extension 4a
  - raid-asm-remote-serializes-claims
priority: must
---

## Detail

The pass line is the register assumption's probe, run for real: two
clients push a claim for one iteration name against origin within
seconds; one push accepted, one rejected non-fast-forward, the loser
re-offers the next stub.
