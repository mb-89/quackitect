---
id: req-stale-verdict-never-applies
type: "[[requirement]]"
statement: "If the evidence behind an offered gate changed after the offer, then the engine shall refuse to apply a verdict answering that offer."
kind: functional
verify_method: test
breaks_if_removed: "A bless given on yesterday's evidence lands on today's, and the record lies about what was judged."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: must
---

## Detail

## Detail

- The offered evidence's identity binds the verdict; a mismatch refuses.
- A verdict already honored is ignored on re-arrival, with the grant chain unchanged.
