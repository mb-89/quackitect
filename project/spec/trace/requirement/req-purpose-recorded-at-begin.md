---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-purpose-recorded-at-begin
type: "[[requirement]]"
statement: When a new product is begun with a stated purpose, the engine shall carry that purpose into the scaffolded product as one recorded statement.
kind: functional
verify_method: inspection
breaks_if_removed: The product's purpose lives only in chat and is lost to the next session.
breaks_how_badly: corrosive
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 1
  - ".se/req-mine-sebots.md: state — derived, append-only, on disk"
priority: could
weighs_against:
  - req-setup-serves-shipped-method > — a purpose lost to the next session beats a builder having to overlay before trying
---
