---
id: req-decision-realized-lint
type: requirement
statement: If a blessed adoption decision has no implementing design, then quack lint shall flag it, skipping vetoes and defers.
depends_on: []
class: review
killer: false
phase: [maintenance]
discipline: [process]
quality: [maintainability]
---
## Rationale (not load-bearing)
The confirm/verify lint: derived classes make the veto/defer skip mechanical, so the rule can never nag a graveyard entry.
