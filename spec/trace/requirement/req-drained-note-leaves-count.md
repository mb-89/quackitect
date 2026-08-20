---
minted_in: i1
id: req-drained-note-leaves-count
type: "[[requirement]]"
statement: When a drain is accepted, the engine shall remove the note from the pending count and shall retain the note with its disposition.
kind: functional
verify_method: test
breaks_if_removed: The inbox cannot reach zero honestly, or a drained judgment vanishes and is re-litigated.
breaks_how_badly: corrosive
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 6
  - ".se/req-mine-v2.md: notes and the toll (v2-081)"
priority: should
weighs_against:
  - req-parked-note-re-drains >
---
