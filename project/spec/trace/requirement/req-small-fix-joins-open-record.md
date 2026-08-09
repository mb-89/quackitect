---
id: req-small-fix-joins-open-record
type: "[[requirement]]"
statement: If the work is a single small fix while a record stands open, then the desk shall place it in the open record and shall open no new record.
kind: functional
verify_method: demonstration
breaks_if_removed: Every small fix mints a record and record overhead swamps the work it holds.
breaks_how_badly: corrosive
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed ext 3a
priority: should
weighs_against:
  - req-routing-reasoning-recorded >
---
