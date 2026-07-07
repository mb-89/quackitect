---
id: req-clean-status
type: requirement
statement: The engine shall leave the repository tree unmodified on every command except a deliberate truth mutation (bless, baseline re-record).
depends_on: []
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Selftest-able invariant gained by the split; makes accidental repo pollution a deterministic failure instead of a review catch.
