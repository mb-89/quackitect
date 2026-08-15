---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-landing-needs-no-close
type: "[[requirement]]"
statement: While a record stands open, the engine shall accept landings without requiring a close.
kind: functional
verify_method: test
breaks_if_removed: Landings drag a close ritual behind them, so work is hoarded unlanded while records stay open.
breaks_how_badly: corrosive
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record ext 5a
priority: could
weighs_against:
  - req-drumroll-arms-deliberately > — hoarded work is a daily tax; the drumroll is one control on one surface
---
