---
unreachable_refs:
  - cand-whoever-holds-the-hands-decides
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: if-method-compiler-to-sizing
type: "[[interface]]"
statement: The method compiler hands the compiled machine to the sizing element, which is where a step's difficulty is read off the cell the compile carried onto it.
source: el-method-compiler
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
