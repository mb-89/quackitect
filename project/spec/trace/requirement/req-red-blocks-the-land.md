---
id: req-red-blocks-the-land
type: "[[requirement]]"
statement: "While the battery reports one or more failing tests, the engine shall refuse advance past the land gate and offer zero paths to mark a test known-broken."
kind: functional
verify_method: test
breaks_if_removed: "Red work lands marked known-broken; trunk stops being trustworthy."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk ext 3a
  - ".se/req-mine-v1.md: tests and the battery"
priority: must
---
