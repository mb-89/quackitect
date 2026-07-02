---
id: req-evidence-honesty
type: requirement
refines: [uc-reliability]
statement: A test that fails on a live re-run must never display DONE from cached tests-pass evidence; the evidence cache must not mask a red test (fixes the selftest:workspace red-but-DONE masking bug).
depends_on: []
class: review
killer: true
---
