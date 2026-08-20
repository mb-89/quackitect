---
minted_in: i1
id: req-finding-names-its-home
type: "[[requirement]]"
statement: When the sweep reports a finding, the finding shall name the file that carries the drift.
kind: functional
verify_method: inspection
breaks_if_removed: Fixes land beside the drift instead of on it; workarounds pile up where the source stays wrong.
breaks_how_badly: corrosive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up step 3
priority: should
weighs_against:
  - req-sweep-covers-every-drift-class >
---
