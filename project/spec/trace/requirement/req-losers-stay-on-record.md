---
id: req-losers-stay-on-record
type: "[[requirement]]"
statement: The engine shall keep every unchosen option readable after the choice, each with its recorded reasoning.
kind: functional
verify_method: inspection
breaks_if_removed: Dead options return as fresh ideas and are re-worked by whoever was not there when they lost.
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 6
  - ".se/req-mine-sebots.md: rejections need memory"
priority: should
weighs_against:
  - req-choosing-none-is-legal >
---
