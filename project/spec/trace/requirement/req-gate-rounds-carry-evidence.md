---
id: req-gate-rounds-carry-evidence
type: "[[requirement]]"
statement: "While any land-gate round lacks its evidence, the engine shall refuse the bless and name the unfilled round."
kind: functional
verify_method: test
breaks_if_removed: "A gate blesses on empty rounds; the form claims evidence nothing shows."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 4
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
priority: should
---
