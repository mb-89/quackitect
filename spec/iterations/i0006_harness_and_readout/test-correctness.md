---
id: test-correctness
type: test
verifies: [req-lean-enforces-trace]
statement: Selftest asserts the lean checklist template carries the derived coverage checks (req-traced, req-has-test, adr-traced, designs-realized) so lean structurally enforces the trace. (The other correctness concerns — no trace-typed node is a gate; tests-pass uses the in-process evaluator — are already covered by i0004's selftest:no-trace-gate and selftest:tests-pass-eval.)
class: review
verify: selftest:correctness
killer: false
---
## Rationale (not load-bearing)
i0006. Only req-lean-enforces-trace is new; the other two retro notes were already realized in i0004.
