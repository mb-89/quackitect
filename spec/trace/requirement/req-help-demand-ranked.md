---
minted_in: i8
id: req-help-demand-ranked
type: "[[requirement]]"
statement: The se_help tool shall expose the logged misses as a ranked demand list, grouped by query shape, most-demanded first.
kind: functional
verify_method: test
breaks_if_removed: The retro must read raw miss records one at a time instead of a ranked list, which is the hand-mining this iteration exists to replace (guidance/method/retro.md step 8).
breaks_how_badly: abrasive
refines:
  - uc-find-the-right-lane-tool
source_refs:
  - uc-find-the-right-lane-tool step 4a
priority: must
---
