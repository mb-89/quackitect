---
id: req-archive-read-only
type: "[[requirement]]"
statement: If an edit targets an archived record, then the engine shall refuse it, state that the archive is read-only, and change zero bytes of the record.
kind: functional
verify_method: test
breaks_if_removed: A finished record stops being evidence the moment anyone can rewrite it.
refines:
  - uc-browse-the-archive
  - uc-close-a-record
source_refs:
  - uc-browse-the-archive ext 4a
  - uc-close-a-record step 6
  - ".se/req-mine-v1.md: the ledger and truth — archive read natively"
  - uc-browse-the-archive step 1
priority: must
---

## Detail

What browsing may never touch:

- While the archive is browsed, the engine shall write zero changes to any live record, any machine state, and the walk.
