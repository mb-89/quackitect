---
id: req-decision-kinds
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: The engine shall carry one decision node type with a kind of architecture, project, or waiver, and the book shall render each kind in its owning chapter view.
class: review
killer: false
---
## Rationale (not load-bearing)
Waivers are project decisions, not ADRs (owner ruling): accepting a failed test is a project call. One decision type, three kinds; ch4 filters architecture, ch5 waivers, ch6 project (the tailoring record is its first row). Existing adr-* ids stay - the prefix follows the kind going forward (adr-, dec-, wvr-). Waiver checks are user-adjudicated gates.
