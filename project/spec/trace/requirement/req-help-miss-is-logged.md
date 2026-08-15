---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: req-help-miss-is-logged
type: "[[requirement]]"
statement: The se_help tool shall record every query that returns no match to a durable demand log, with the query text and a timestamp.
kind: functional
verify_method: test
breaks_if_removed: A capability gap that agents keep hitting leaves no trace, so the retro has nothing to read except a hand-mined shell log.
breaks_how_badly: corrosive
refines:
  - uc-find-the-right-lane-tool
source_refs:
  - uc-find-the-right-lane-tool step 2a
  - record.md vision (i8), "keep the DEMAND LOG"
priority: must
---
