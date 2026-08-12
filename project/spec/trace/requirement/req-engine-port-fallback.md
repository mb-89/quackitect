---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-engine-port-fallback
type: "[[requirement]]"
statement: If the engine's preferred port is taken, then the engine shall bind the next free port.
kind: functional
verify_method: test
breaks_if_removed: A busy port kills the install on exactly the machines that already run other tools.
breaks_how_badly: crippling
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect ext 3a
priority: should
weighs_against:
  - req-missing-provider-named >
---

## Detail

The panel follows the bound port with zero person action.
