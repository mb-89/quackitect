---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-moved-evidence-invalidates-the-bless
type: "[[requirement]]"
statement: When the evidence under a bless changes, the engine shall mark the depending gate suspect and shall refuse any verdict answering the older offer.
kind: functional
verify_method: test
breaks_if_removed: A bless outlives the thing it approved, and the record claims a review that never covered what now stands.
breaks_how_badly: fatal
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 5a
  - ".se/req-mine-v1.md: the ledger and truth"
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: must
---

## Detail

The one rule, at both moments it binds:

- When blessed evidence or an artifact it cites changes, the engine shall mark the depending gate suspect.
- If the evidence behind an offered gate changed after the offer, then the engine shall refuse to apply a verdict answering that offer.
