---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-cell-edit-lands-in-the-note
type: "[[requirement]]"
statement: When a table cell is edited, the engine shall write exactly that key on the note behind the row, leaving the note's body byte-identical.
kind: functional
verify_method: test
breaks_if_removed: A cell edit that touches more than its key corrupts notes at table speed, fifty at a sitting.
breaks_how_badly: crippling
refines:
  - uc-view-notes-as-a-table
source_refs:
  - reverse-engineered from tests/tables.test.ts and tests/frontmatter.test.ts
priority: must
---

## Detail

- A scalar lands as a scalar, a list is written from the typed text, and emptying a cell clears the key.
- A wrong type refuses and the note is untouched.
- A computed column (a file field, a nested value) is locked, with the reason shown.
- A cell write may not land outside the vault or write anything but a note.
