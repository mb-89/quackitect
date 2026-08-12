---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-land-is-one-piece
type: "[[requirement]]"
statement: When the land gate is blessed, the engine shall merge the record's branch onto trunk as one merge, or stop and merge nothing.
kind: functional
verify_method: test
breaks_if_removed: A half-landed record leaves trunk in a state nobody chose and nobody can name.
breaks_how_badly: crippling
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 6
  - ".se/req-mine-v2.md: worktrees and parallel streams"
  - uc-land-work-on-trunk ext 6a
  - uc-land-work-on-trunk ext 6b
priority: must
---

## Detail

The one act, and what it leaves behind:

- If the merge onto trunk conflicts, then the engine shall stop the land, name every conflicting file, and merge nothing.
- Where the record belongs to an open expedition, the land shall leave the expedition open.
