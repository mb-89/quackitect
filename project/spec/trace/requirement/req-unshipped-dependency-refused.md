---
minted_in: i1
id: req-unshipped-dependency-refused
type: "[[requirement]]"
statement: If an iteration declares a dependency on an iteration that has not shipped, then the engine shall refuse its open AND its claim, naming the unmet dependency both times.
kind: functional
verify_method: test
breaks_if_removed: An iteration builds on unshipped work and its baseline shifts under it - or a peer machine claims work it cannot legally start.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 1
  - ".se/req-mine-v2.md: Worktrees and parallel streams"
priority: should
weighs_against:
  - req-walk-opens-at-retro >
  - req-force-release-recorded >
---
