---
id: req-land-needs-person-bless
type: "[[requirement]]"
statement: "The engine shall advance the walk past the land gate only on a person's bless."
kind: functional
verify_method: test
breaks_if_removed: "An agent lands its own work unreviewed; the person's bless behind every land becomes a lie."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 2
  - uc-land-work-on-trunk step 5
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
priority: must
---
