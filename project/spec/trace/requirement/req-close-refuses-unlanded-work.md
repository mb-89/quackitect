---
id: req-close-refuses-unlanded-work
type: "[[requirement]]"
statement: "If the record holds work that has not landed, then the engine shall refuse the close, naming the unlanded work."
kind: functional
verify_method: test
breaks_if_removed: "A close archives a record whose work never reached the trunk, and the unlanded work dies with the record's worktree."
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record precondition
  - uc-close-a-record ext 6a
priority: should
---
