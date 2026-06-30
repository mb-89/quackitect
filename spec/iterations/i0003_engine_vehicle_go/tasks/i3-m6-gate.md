---
id: i3-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i3-m6-build-planned,i3-m6-go-scaffold,i3-m6-go-parser,i3-m6-go-engine-core,i3-m6-go-coverage-ids,i3-m6-go-cli-help,i3-m6-go-report,i3-m6-go-trace-filter,i3-m6-overlay-resolver,i3-m6-deps-prompt,i3-m6-parity-perf,i3-m6-detailed-design-complete,i3-m6-impl-risks-acceptable,i3-m6-internal-quality-ok,i3-m6-verification-green, i3-m5-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
