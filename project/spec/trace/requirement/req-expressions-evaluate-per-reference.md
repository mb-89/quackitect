---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-expressions-evaluate-per-reference
type: "[[requirement]]"
statement: When a formula runs, the engine shall evaluate it per the expression reference, and shall refuse an expression outside the language with its position named.
kind: functional
verify_method: test
breaks_if_removed: Formulas drift from the family's documented language, and a view written elsewhere computes different answers here.
breaks_how_badly: crippling
refines:
  - uc-shape-the-view
source_refs:
  - reverse-engineered from tests/expr.test.ts
priority: must
---

## Detail

- The documented functions, methods, operators, units and date arithmetic evaluate per the reference, each pinned by its own case.
- An unknown function, method, formula or unit refuses by name and lists what is known.
- A character outside the language refuses with its position; leftover input refuses rather than being ignored.
- A formula may use another formula; a self-reference refuses rather than hanging.
- A nondeterministic call refuses where a render must regenerate byte-identically.
