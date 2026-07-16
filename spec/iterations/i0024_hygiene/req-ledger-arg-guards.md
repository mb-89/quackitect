---
id: req-ledger-arg-guards
type: requirement
statement: If a ledger command names a wrong id, then the engine shall refuse it.
---
## Statements
1. If bless names an unknown check id, then the engine shall refuse with near matches.
2. If start names a never-registered version, then the engine shall refuse with a pointer at start --plan.
3. If start names the active version, then the engine shall refuse as a no-op and leave iteration.md untouched.

Owner rulings 2026-07-15: plan-first activation. Both halves of the b3-probe incident die here.
