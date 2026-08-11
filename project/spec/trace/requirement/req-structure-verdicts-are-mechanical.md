---
id: req-structure-verdicts-are-mechanical
type: "[[requirement]]"
statement: When a gate reviews the design's structure, the engine shall compute the structural verdicts per the Detail table, with zero verdicts typed by hand.
kind: functional
verify_method: test
breaks_if_removed: The structural homework gets vibe-checked, and a leaking decomposition passes a gate on prose.
breaks_how_badly: crippling
refines:
  - uc-adjudicate-a-gate
source_refs:
  - reverse-engineered from tests/flowclosure.test.ts, tests/elematrix.test.ts, tests/dsm.test.ts and tests/atamwalk.test.ts
priority: must
---

## Detail

- Flow closure: a flow nothing produces or nothing consumes is red; a marked boundary flow is excused its outward half.
- The element matrix: a flow crossing two elements owes their pair an interface cell; holes and surplus interfaces are both named.
- Clustering: the same input gives the same picture; a placement made by hand is never moved.
- The quality deck: scenarios deal worst grade first, and an unruled scenario blocks the deck.
