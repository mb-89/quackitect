---
id: req-rigor-fit
type: requirement
statement: When a version's composed trace size falls outside the chosen rigor's fit band, quack lint shall report an advisory rigor-fit finding - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When the composed node count falls outside the configured rigor's fit band, quack lint shall report an advisory rigor-fit finding naming the count and the band.
2. The rigor-fit finding shall remain in the advisory class.

## Rationale (not load-bearing)
Owner feature note NOTE-20260712-132653: systematic for a pong-sized project is overkill -
detect the mismatch, recommend, never decide. Advisory by design: contract rule 5 keeps the
human confirming rigor at start; the engine only hints. The fit bands live with the rigor
definitions so the data has one home.
