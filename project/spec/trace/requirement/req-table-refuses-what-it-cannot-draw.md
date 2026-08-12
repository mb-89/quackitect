---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-table-refuses-what-it-cannot-draw
type: "[[requirement]]"
statement: If a view names a layout, view type or operator outside the engine's vocabulary, then the engine shall refuse by name and list what it accepts.
kind: functional
verify_method: test
breaks_if_removed: An unsupported view draws something wrong-but-plausible, and the reader trusts a picture nobody built.
breaks_how_badly: corrosive
refines:
  - uc-shape-the-view
source_refs:
  - reverse-engineered from tests/bases.test.ts and tests/tables.test.ts
priority: must
---

## Detail

- An unknown layout refuses and lists the registry.
- An unknown operator refuses and lists the vocabulary.
- An unknown view names the ones that exist.
- A view file that does not parse refuses in place and leaves the file alone.
