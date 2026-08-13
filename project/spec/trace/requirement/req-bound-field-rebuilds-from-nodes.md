---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-bound-field-rebuilds-from-nodes
type: "[[requirement]]"
statement: While a form field is bound to trace nodes, the engine shall rebuild the field from the nodes on every look and shall land every cell write on the node it names.
kind: functional
verify_method: test
breaks_if_removed: The form keeps a second copy of the register, and the copy wins the disagreement — the exact defect the binding replaced.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - reverse-engineered from tests/binding.test.ts
priority: must
---

## Detail

- The value is read off the node, and only out of its frontmatter.
- A cell still carrying its template comment is unanswered, exactly like an empty one.
- A key owns its block list: a scalar write does not leave old items dangling, and clearing removes the key.
- A dollar sequence in an answer is written literally, never interpreted.
