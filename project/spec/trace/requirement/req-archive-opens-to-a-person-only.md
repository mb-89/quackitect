---
minted_in: i1
id: req-archive-opens-to-a-person-only
type: "[[requirement]]"
statement: If an agent attempts to browse the archive, then the engine shall refuse at every autonomy setting, naming the person-only rule.
kind: functional
verify_method: test
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
