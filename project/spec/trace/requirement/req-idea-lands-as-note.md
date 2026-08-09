---
id: req-idea-lands-as-note
type: "[[requirement]]"
statement: If the stated work is a doubt or an idea rather than a task, then the desk shall capture it as a note and shall open no record.
kind: functional
verify_method: test
breaks_if_removed: Doubts and ideas either vanish or mint empty records, and the inbox stops being the home for strays.
breaks_how_badly: corrosive
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed ext 3b
  - ".se/req-mine-sebots.md: capture, decisions, change (frictionless capture)"
priority: should
---
