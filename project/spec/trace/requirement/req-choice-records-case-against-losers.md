---
minted_in: i1
id: req-choice-records-case-against-losers
type: "[[requirement]]"
statement: When an option is chosen, the engine shall record the reasoning against each unchosen option beside the choice.
kind: functional
verify_method: test
breaks_if_removed: The choice stands bare, and whoever asks why the losers lost re-litigates the decision from scratch.
breaks_how_badly: corrosive
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 5
  - ".se/req-mine-v2.md: v2-023 Pugh shape"
  - ".se/req-mine-v1.md: views chosen — the rejected kinds recorded"
priority: must
---
