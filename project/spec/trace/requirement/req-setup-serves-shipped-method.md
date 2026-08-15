---
minted_in: i1
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
weighs_against:
  - req-second-product-reuses-install > — not being able to try the engine blocks adoption; a repeated install only slows it
---
