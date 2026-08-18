---
minted_in: i1
id: req-setup-serves-shipped-method
type: "[[requirement]]"
statement: When the setup runs in a copy with no overlay present, the product shall come up serving the method it shipped with, and with zero builder-authored configuration files.
kind: functional
verify_method: demonstration
breaks_if_removed: A copy demands method authoring on day one, so a builder cannot try the system before overlaying it.
breaks_how_badly: corrosive
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 2
priority: could
weighs_against:
  - req-second-product-reuses-install > — not being able to try the engine blocks adoption; a repeated install only slows it
---
