---
minted_in: i1
id: fn-run-a-governed-walk.work-the-register
type: "[[function]]"
cluster: the-account
statement: present the record's notes as one live register a person reads and edits in place
satisfies:
  - req-table-rows-derive-from-notes
  - req-cell-edit-lands-in-the-note
  - req-table-refuses-what-it-cannot-draw
  - req-view-writes-round-trip
  - req-query-is-the-file
  - req-grouping-and-sorting-hold
  - req-expressions-evaluate-per-reference
inputs:
  - flow-note-inbox
  - flow-trace-graph
outputs:
  - flow-surface
controls:
  - the view declaration, which is itself a file
  - the rule that a cell write lands on the note it names
source_refs:
  - uc-view-notes-as-a-table
  - uc-shape-the-view
---

## Rationale

THE REGISTER IS NOTES, AND THE TABLE IS A VIEW — this function is the
view made workable. Rows derive from the notes on every look; a cell
edit lands on the note it names; what cannot be drawn is refused by
name, never silently skipped.

THE QUERY IS A FILE. The view declaration lives in the repository like
everything else, so shaping the view is an edit, and two people see one
truth.

It is distinct from showing the position (the showing function): that
one presents the WALK, this one presents the WORK — the notes
themselves, grouped, sorted and computed over.
