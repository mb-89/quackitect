---
minted_in: i1
id: req-extension-replaced-reported
type: "[[requirement]]"
statement: If the editor extension stands installed at another version, then the script shall replace it and shall report the version that now stands.
kind: functional
verify_method: test
breaks_if_removed: A stale extension stays and the panel's behavior stops matching the engine's.
breaks_how_badly: corrosive
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect ext 3b
priority: should
weighs_against:
  - req-engine-port-fallback >
---
