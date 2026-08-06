---
id: req-landing-needs-no-close
type: "[[requirement]]"
statement: While a record stands open, the engine shall accept landings without requiring a close.
kind: functional
verify_method: test
breaks_if_removed: Landings drag a close ritual behind them, so work is hoarded unlanded while records stay open.
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record ext 5a
priority: could
---
