---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-method-reuse-is-vendoring
type: "[[requirement]]"
statement: If reuse of another product's method is requested at begin, then the engine shall name the vendoring path and copy zero method files as part of the scaffold.
kind: functional
verify_method: test
breaks_if_removed: Method files fork silently at scaffold time, with no declared dependency to reconcile later.
breaks_how_badly: corrosive
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product ext 7a
  - ".se/req-mine-v2.md: dependencies and the ship review"
priority: could
weighs_against:
  - req-landing-needs-no-close > — an undeclared dependency outlives the record; hoarded landings are recoverable by landing
---
