---
id: req-kickoff-refuses-pending-notes
type: "[[requirement]]"
statement: While the notes inbox holds pending notes, the engine shall refuse the iteration kickoff and name the pending count.
kind: functional
verify_method: test
breaks_if_removed: The kickoff starts over an undrained inbox; a noted ruling gets built around.
breaks_how_badly: corrosive
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration ext 3a
  - ".se/req-mine-v2.md: Notes and the toll"
priority: should
weighs_against:
  - req-drained-note-leaves-count >
---
