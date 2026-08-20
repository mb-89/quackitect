---
minted_in: i1
id: req-duplicate-stray-still-captured
type: "[[requirement]]"
statement: If a captured finding duplicates a standing note, then the engine shall store it anyway, refusing zero captures for duplication.
kind: functional
verify_method: test
breaks_if_removed: Finders stop to compare against the inbox before writing, and capture stops being frictionless.
breaks_how_badly: abrasive
refines:
  - uc-capture-a-stray
source_refs:
  - uc-capture-a-stray ext 2a
priority: could
weighs_against:
  - req-clean-sweep-is-dated > — friction at capture loses findings outright; an undated clean sweep loses only the date
---
