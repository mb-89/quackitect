---
id: req-choosing-none-is-legal
type: "[[requirement]]"
statement: When the person rules that no option qualifies, the engine shall record the outcome as none chosen, with what has to change for an option to qualify.
kind: functional
verify_method: test
breaks_if_removed: A forced pick beats an honest none, and a bad option wins because the form demanded a winner.
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding ext 5a
  - ".se/req-mine-sebots.md: overrides recorded as overrides"
priority: should
---
