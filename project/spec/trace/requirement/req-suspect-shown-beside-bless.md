---
id: req-suspect-shown-beside-bless
type: "[[requirement]]"
statement: "Where a gate's input moved after its bless, the archive shall show the suspect mark and its reason beside the bless, never in place of it."
kind: functional
verify_method: test
breaks_if_removed: "A moved input hides or erases the bless, and honest history reads as a clean pass."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive ext 5a
  - ".se/req-mine-v1.md: the ledger and truth"
priority: should
---
