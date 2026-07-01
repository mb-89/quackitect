---
id: req-lean-enforces-trace
type: requirement
refines: [uc-engine-correctness]
statement: Lean rigor structurally enforces the trace via derived coverage checks (req-traced, req-has-test, adr-traced, designs-realized) in addition to tests-pass — so even at the lean floor the trace is gated, only the human review count is reduced. The lean checklist template carries these checks.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006 requirement under uc-engine-correctness.
