---
id: req-parked-list
type: requirement
refines: [uc-decisions-never-relitigated]
statement: When quack decisions --parked runs, the engine shall list exactly the defer nodes without an incoming supersedes edge.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Engage-start migration walks this list instead of raw backlog files; the condition judgment stays with the adjudicator at planning time. The report's graveyard/parked panels render the same derived sets.
