---
id: se.uc-4
kind: use_case
statement: "Two agents in parallel: two iterations side by side, or sub-agents on independent states within one iteration."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  source: se-v2-design.md §2
passes_when: "Across iterations: both complete, both merge, and the second merge correctly marks suspects created by the first. Within one iteration: independent active states run by distinct agents both complete, the join waits for all fired inputs, and each fill records its actor."
---

## Passes when

Across iterations: both complete, both merge, and the second merge correctly marks suspects created by the first.

Within one iteration: independent active states run by distinct agents both complete, the join waits for all fired inputs, and each fill records its actor.
