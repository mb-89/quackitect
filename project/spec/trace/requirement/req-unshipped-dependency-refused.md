---
id: req-unshipped-dependency-refused
type: "[[requirement]]"
statement: If an entered iteration declares a dependency on an iteration that has not shipped, then the engine shall refuse the open and name the unmet dependency.
kind: functional
verify_method: test
breaks_if_removed: An iteration builds on unshipped work and its baseline shifts under it.
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 1
  - ".se/req-mine-v2.md: Worktrees and parallel streams"
priority: should
weighs_against:
  - req-walk-opens-at-retro >
---
