---
id: req-extension-replaced-reported
type: "[[requirement]]"
statement: "If the editor extension stands installed at another version, then the script shall replace it and shall report the version that now stands."
kind: functional
verify_method: test
breaks_if_removed: "A stale extension stays and the panel's behavior stops matching the engine's."
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect ext 3b
priority: should
---
