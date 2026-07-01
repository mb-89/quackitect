---
id: req-handover-pager
type: requirement
refines: [uc-bless-readout]
statement: When a killer gate is handed to the human, the engine renders a one-pager (a function under `report`): the progress bar, the biggest decisions (linking the iteration's ADRs), the biggest risks (from the M1 frame), deterministic readiness facts (subtasks done, upstream SUSPECT, evidence-doc present), and a bless y/n line. Decisions and risks link to their trace nodes, not restated.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006 requirement under uc-bless-readout.
