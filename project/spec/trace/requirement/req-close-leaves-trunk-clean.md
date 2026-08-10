---
id: req-close-leaves-trunk-clean
type: "[[requirement]]"
statement: When a record closes, the engine shall commit the record's strays, leaving zero uncommitted changes from the record on the trunk.
kind: functional
verify_method: test
verified_by:
  - "tests/editsafety.test.ts :: the close COMMITS the trunk's strays rather than refusing, and says which"
breaks_if_removed: Every close leaves uncommitted strays behind, and the next record opens on a dirty trunk it did not make.
breaks_how_badly: corrosive
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record step 5
  - uc-close-a-record guarantee
priority: should
weighs_against:
  - req-archive-lists-every-closed-record >
---
