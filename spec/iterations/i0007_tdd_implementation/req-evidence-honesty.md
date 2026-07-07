---
id: req-evidence-honesty
type: requirement
statement: A test that fails on a live re-run must never display DONE from cached tests-pass evidence; the evidence cache must not mask a red test (fixes the selftest:workspace red-but-DONE masking bug).
depends_on: []
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [process]
quality: [reliability]
---
