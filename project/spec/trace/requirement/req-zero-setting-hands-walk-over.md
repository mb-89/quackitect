---
id: req-zero-setting-hands-walk-over
type: "[[requirement]]"
statement: "Where the autonomy setting is zero, the engine shall enter zero steps on an agent's behalf."
kind: functional
verify_method: test
breaks_if_removed: "The fully-manual walk is impossible; the person cannot decline agent involvement."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy ext 1a
  - ".se/req-mine-sebots.md: the person's dial and the manual path"
priority: must
---
