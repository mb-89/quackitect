---
id: req-compaction-reowes-the-reading
type: "[[requirement]]"
statement: "When a reader's context is compacted, the engine shall owe the full reading again."
kind: functional
verify_method: test
breaks_if_removed: "A compacted agent walks on with the method gone from its head, and nothing notices."
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method trigger
  - uc-be-handed-the-method ext 5a
  - ".se/req-mine-sebots.md: context discipline"
priority: must
---
