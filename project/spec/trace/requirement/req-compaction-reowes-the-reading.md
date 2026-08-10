---
id: req-compaction-reowes-the-reading
type: "[[requirement]]"
statement: When a reader's context is compacted, the engine shall owe the full reading again.
kind: functional
verify_method: test
verified_by:
  - "tests/boot.test.ts :: se_pull answers an instruction — legal everywhere, and a fresh session owes reading"
breaks_if_removed: A compacted agent walks on with the method gone from its head, and nothing notices.
breaks_how_badly: fatal
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method trigger
  - uc-be-handed-the-method ext 5a
  - ".se/req-mine-sebots.md: context discipline"
priority: must
---
