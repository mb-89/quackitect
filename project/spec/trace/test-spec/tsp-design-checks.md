---
id: tsp-design-checks
type: "[[test-spec]]"
statement: The design-phase machinery computes its structural verdicts, binds its forms to the nodes, and compiles a drawing like a row, verified by test over the M4-to-M6 engines.
method: test
verifies:
  - req-structure-verdicts-are-mechanical
  - req-bound-field-rebuilds-from-nodes
  - req-drawn-state-equals-a-row
files:
  - tests/atamwalk.test.ts
  - tests/dsm.test.ts
  - tests/elematrix.test.ts
  - tests/flowclosure.test.ts
  - tests/binding.test.ts
  - tests/drawnsub.test.ts
  - tests/arrows.test.ts
---

## Scope

The machinery that checks the design's homework: flow closure, the
element matrix, the clustering, the quality deck, the node-bound forms,
and the drawn sub-machines.

## Approach

Component level over minted structures. Fault-based for the verdicts —
each red forced on purpose (an unconsumed flow, a missing interface, an
unruled scenario) and each green earned. Determinism asserted where a
person's placement must survive the machine's pass.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a flow nothing consumes is red; a flow
crossing two elements owes their pair a cell, and holes are named; a
placement made by hand is never moved by the search; the deck deals
worst grade first; the value is read off the node, and only out of its
frontmatter; a drawn state declares evidence exactly as a matrix row
does.
