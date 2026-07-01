---
id: uc-engine-correctness
type: usecase
refines: [need-qualities]
statement: ISO/IEC 25010 Functional Correctness — the determinizer's own checks are internally consistent (one evaluation path for executed checks) and structurally enforce the trace at every rigor (including lean), so the ledger cannot silently mis-report.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Folds the retro correctness notes (tests-pass evaluator split; trace-typed nodes dangling as gates) and the lean-enforces-trace template fix.
