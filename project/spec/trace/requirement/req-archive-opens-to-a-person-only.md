---
id: req-archive-opens-to-a-person-only
type: "[[requirement]]"
statement: If an agent attempts to browse the archive, then the engine shall refuse at every autonomy setting, naming the person-only rule.
kind: functional
verify_method: test
verified_by:
  - "tests/threshold.test.ts :: the gate weighs the TARGET: a 0.4 state waits at 0.2, the archives wait at ANY slider, the human may anyway"
  - "tests/container.test.ts :: the archive: start reaches every closed expedition, each runs to end, browsing is human-only"
breaks_if_removed: Agents wander closed records, and the archive's person-only law erodes silently.
breaks_how_badly: corrosive
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive ext 1a
priority: should
weighs_against:
  - req-archive-releases-worktrees >
---
