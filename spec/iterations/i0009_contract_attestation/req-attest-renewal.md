---
id: req-attest-renewal
type: requirement
statement: When a renewal presents the most recently issued session key together with a correct challenge answer, the engine shall issue a successor key without a console grant.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [security]
---
## Rationale (not load-bearing)
Key chaining: possession of the previous key proves same-context; the fresh challenge forces the per-engage contract re-read. Long unattended runs self-renew — the machinery never parks on the adjudicator mid-session.
