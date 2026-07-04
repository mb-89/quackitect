---
id: req-decision-realized-lint
type: requirement
refines: [uc-decisions-never-relitigated]
statement: If a blessed adoption decision has no implementing design, then quack lint shall flag it, skipping vetoes and defers.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
The confirm/verify lint: derived classes make the veto/defer skip mechanical, so the rule can never nag a graveyard entry.
