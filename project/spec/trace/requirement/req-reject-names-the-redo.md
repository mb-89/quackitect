---
id: req-reject-names-the-redo
type: "[[requirement]]"
statement: When the person rejects at the land gate, the engine shall keep the work in the record's worktree and name each round to redo.
kind: functional
verify_method: test
breaks_if_removed: A reject strands the work with no named path back; the person's no destroys instead of steers.
breaks_how_badly: corrosive
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk ext 5a
priority: should
---
