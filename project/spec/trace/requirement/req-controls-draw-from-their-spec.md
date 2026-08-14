---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-controls-draw-from-their-spec
type: "[[requirement]]"
statement: The engine shall draw the control bar from its spec file, and shall refuse an undeclared widget type by name.
kind: functional
verify_method: test
breaks_if_removed: Controls live in code, a host draws its own divergent bar, and a spec edit changes nothing.
breaks_how_badly: corrosive
refines:
  - uc-set-the-autonomy
source_refs:
  - reverse-engineered from tests/params.test.ts and tests/scale.test.ts
priority: should
weighs_against:
  - req-selected-node-shows-its-claim > — a spec edit that changes nothing beats a slower survey
---

## Detail

- The shipped bar is read from its spec, never from code; the host draws no control of its own.
- A choice renders every option the spec names, and only those.
- The scale offers a notch at zero, so a full block is one click away; climbing is one rung at a time.
- An undeclared widget type refuses rather than being skipped.
