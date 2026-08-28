---
unreachable_refs:
  - cand-whoever-holds-the-hands-decides
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: if-engine-delta-to-sizing
type: "[[interface]]"
statement: The engine delta hands the compiled machine to the sizing element, so a step's difficulty is read from the machine the walk is actually running rather than from the matrix on disk.
source: el-engine-delta
destination: el-sizing
carries:
  - flow-compiled-machine
form: call
source_refs:
  - fn-run-a-governed-walk.obtain-a-step-s-difficulty
  - el-sizing
  - cand-whoever-holds-the-hands-decides
---

THE SIZING ELEMENT READS A STEP, NEVER THE MATRIX. What crosses here is the
compiled machine, and the difficulty is taken from the step in hand rather than
looked up against a row. That is what makes obtain-a-step-s-difficulty a field
read instead of a join, and it is why the element has two interfaces rather than a
lookup path into the corpus.

Boundary: one flow, one direction, no answer. The sizing element returns nothing
across this edge; what it produces leaves by if-sizing-to-agent-harness.
