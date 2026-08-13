---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-parked-note-re-drains
type: "[[requirement]]"
statement: When a new drain names a note standing in backlog, the engine shall accept it and shall record the new disposition as superseding the old.
kind: functional
verify_method: test
breaks_if_removed: A parked note whose condition came true has no road back into scope.
breaks_how_badly: corrosive
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox ext 6a
  - uc-drain-the-inbox ext 3c
priority: should
weighs_against:
  - req-unknown-drain-ref-refused >
---
