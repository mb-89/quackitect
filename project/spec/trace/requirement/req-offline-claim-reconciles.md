---
minted_in: i2-parallel-iterations-across-machines-seed
id: req-offline-claim-reconciles
type: "[[requirement]]"
statement: If the remote is unreachable when a claim is taken, then the claim shall land locally without blocking, and shall push at the next opportunity; a conflict at that push is surfaced to the person, never resolved silently.
kind: functional
verify_method: test
breaks_if_removed: A machine without network cannot work at all, or worse, blocks pretending to wait - the owner accepted the desync risk knowingly instead.
breaks_how_badly: corrosive
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration extension 3a
priority: must
---

## Detail

The owner's ruling, recorded on i2's gate-motivation: the failure to
reach origin is accepted silently, the desync knowingly, and the
conflict at the next push is ours to resolve. Rare by construction -
offline usually means no agent either - but it must work.
