---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: req-help-query-logged-with-result
type: "[[requirement]]"
statement: The se_help tool shall log every call through the normal call log, same as every other lane tool, so a search's outcome is auditable without a second log.
kind: constraint
verify_method: test
breaks_if_removed: se_help's own usage becomes invisible to se_log_query and the retro's mining, breaking the "every call is logged" law the rest of the lane holds to.
breaks_how_badly: abrasive
refines:
  - uc-find-the-right-lane-tool
source_refs:
  - project/guidance/CLAUDE.md "the lane — the tools, and the cage around them", "Every call is logged raw to .se/calls.jsonl"
priority: must
---
