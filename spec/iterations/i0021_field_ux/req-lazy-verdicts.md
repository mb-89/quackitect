---
id: req-lazy-verdicts
type: requirement
statement: While a walk command runs, the engine shall answer coverage from cached verdicts only - a moved hash counts unverified and nothing re-runs - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. While a walk command runs (bless, next, status, and their peers), the engine shall answer coverage from cached verdicts only, counting a moved hash as not-verified without running a test.
2. Only the explicit verification surfaces - the selftest battery and verify - shall re-run tests; every other command, the report and hand-off renders included, answers from the cache.

## Rationale (not load-bearing)
The owner's live complaint (2026-07-14): every ledger command after a content edit paid a
15-25 s verdict storm - the walk's own no-over-checking law, never baked into the engine. The
why-panel set the precedent ("unverified at this build", no battery); this widens it to the
walk. Tightened the same day (owner ruling, second complaint): report/progress/build also
went lazy - the full battery belongs to V&V, run ONCE per iteration via an explicit verify
or selftest; a render is allowed to say "unverified at this build".
