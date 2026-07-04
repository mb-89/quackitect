---
id: req-render-drift
type: requirement
refines: [uc-contract-delivery]
statement: If a generated harness entry file differs from a fresh render of the contract source, then quack lint shall flag the drift.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Regeneration-is-a-noop: a hand-edit to a generated file, or a contract edit without re-render, is caught deterministically instead of silently forking the rules.
