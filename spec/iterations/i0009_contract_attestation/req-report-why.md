---
id: req-report-why
type: requirement
statement: When the report's detail panel opens a SUSPECT check, the report shall name the cause of suspicion — the changed input nodes, or the derived-coverage rule whose flip reopened the check.
depends_on: []
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
The owner, 2026-07-04, while adjudicating the M1 gate: 74 global-V&V suspects with no in-report explanation. Pairs with the noted quack-why gap (NOTE-20260704-094230): `why` explains content-hash changes only; the cause computation built here should serve both surfaces. The report stays a pure display — the cause is baked at render, never computed client-side.
