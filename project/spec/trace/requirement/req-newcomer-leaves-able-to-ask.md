---
id: req-newcomer-leaves-able-to-ask
type: "[[requirement]]"
statement: When a newcomer completes their first tour, the engine shall leave at least 2 of 3 newcomers able to name the parts they will use and to pick a fitting desk offer unaided within the same session.
kind: quality
characteristic: interaction-capability
verify_method: demonstration
breaks_if_removed: The tour runs but teaches nothing measurable; nobody can say whether newcomers leave able to ask.
breaks_how_badly: abrasive
refines:
  - uc-quality-interaction-capability
source_refs:
  - uc-learn-the-machinery
  - uc-learn-the-machinery guarantee
  - "meth-requirement-authoring: population measure rule"
priority: should
weighs_against:
  - req-tour-reads-what-stands >
---

## Scenario

- Source: a newcomer (stk-newcomer).
- Stimulus: asks the front desk for a tour and completes it.
- Artifact: the tour and the desk's offer list.
- Environment: the newcomer's first session; the front desk reachable; the live machinery loaded.
- Response: the newcomer names the parts they will use and picks the desk offer that fits their next ask, unaided.
- Response measure: at least 2 of 3 newcomers manage both within the same session.
