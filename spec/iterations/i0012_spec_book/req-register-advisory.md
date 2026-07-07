---
id: req-register-advisory
type: requirement
depends_on: []
statement: The engine shall surface register findings for book prose - readability and plain-language signals for the audience baseline - as advisory output that never blocks a gate.
class: review
killer: false
phase: [engineering]
discipline: [design]
quality: [functionality]
---
## Rationale (not load-bearing)
The audience baseline: average professionals, not assumed native speakers (M1 brief; ISO 24495-1 is the citable norm). Advisory by the production lesson (GitLab): readability metrics misfire too often to gate on; errors block, register advises. The engine's advisory lane precedent is the unrealized-adoption lint.
