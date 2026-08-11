---
id: req-table-rows-derive-from-notes
type: "[[requirement]]"
statement: While a live table is open, the engine shall derive every row from the note files on every look, with zero rows held only by the view.
kind: functional
verify_method: test
breaks_if_removed: The table becomes a second copy of the register, and the copy wins a disagreement nobody sees.
breaks_how_badly: crippling
refines:
  - uc-view-notes-as-a-table
source_refs:
  - reverse-engineered from tests/tables.test.ts and tests/vault-sync.test.ts
priority: must
---

## Detail

- Every note of the kind is a row; a note that does not parse is shown as such, never dropped.
- A frontmatter key's column carries the type its values actually hold.
- The warm model is told by lane writes and healed by the watcher; a render never builds it.
