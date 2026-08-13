---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-setup-serves-shipped-method
type: "[[requirement]]"
statement: When the setup runs in a host repository with no overlay present, the product shall come up serving the engine's shipped method with zero builder-authored configuration files.
kind: functional
verify_method: demonstration
breaks_if_removed: Vendoring demands method authoring on day one, so a builder cannot try the engine before overlaying it.
breaks_how_badly: corrosive
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 2
priority: could
---
