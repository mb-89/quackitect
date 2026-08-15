---
id: raid-un-reachable-capability-is-traced
type: "[[raid]]"
kind: issue
statement: The structure does not address req-reachable-capability-is-traced — nothing carries its scenario.
owner: the adjudicator
trigger: any change to the element set, or to req-reachable-capability-is-traced
status: open
impact: The quality goes unprotected into the build.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-reachable-capability-is-traced
---

Found unaddressed at evaluate-architecture by agent. Either the
structure grows a carrier for this scenario, or the requirement moves —
the gate adjudicates which.