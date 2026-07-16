---
id: req-lint-exit-honest
type: requirement
depends_on: []
statement: The engine shall exit lint with the agreed three-code contract: zero for clean or advisory-only, one for findings, two for a refused graph.
class: review
killer: false
---
1. If a lint run reports advisories and no findings, then the engine shall exit with code zero.
2. If a lint run reports findings, then the engine shall exit with code one.
3. If the graph is refused at load, then the engine shall exit with code two.

## Rationale (not load-bearing)
The retro lead NOTE-20260711-180535 (lint): 67 of 80 lint calls "failed" though most carried only the standing adoption advisory. The three-code vocabulary is the owner-agreed contract; consumers of the old advisories-exit-nonzero behavior change meaning - the M2 review checks that no repo consumer relies on it.
