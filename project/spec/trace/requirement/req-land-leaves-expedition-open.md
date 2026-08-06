---
id: req-land-leaves-expedition-open
type: "[[requirement]]"
statement: "Where the record belongs to an open expedition, the land shall leave the expedition open."
kind: functional
verify_method: test
breaks_if_removed: "Every land forces a close; a day's bundle of records cannot keep collecting."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk ext 6b
priority: could
---
