---
id: req-land-runs-battery-fresh
type: "[[requirement]]"
statement: "When the walk reaches the land gate, the engine shall run the full battery and accept zero cached verdicts in its place."
kind: functional
verify_method: test
breaks_if_removed: "A stale green lands broken work; the one place the battery is earned stops proving anything."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 3
  - uc-land-work-on-trunk ext 3b
priority: must
---

## Detail

## Detail

| rule | binding content |
| --- | --- |
| freshness | a green run with no content change since still reruns here — the land gate takes no cached verdict |
| scope | the run covers the battery's whole declared scope |
