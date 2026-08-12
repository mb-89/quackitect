---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-second-product-reuses-install
type: "[[requirement]]"
statement: Where the extension is already installed, the setup of an additional product shall complete with zero further installs of the extension.
kind: functional
verify_method: demonstration
breaks_if_removed: Every additional product costs a full install, and beginning one stops being light.
breaks_how_badly: corrosive
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 6
  - ".se/req-mine-v1.md: lifecycle and distribution"
priority: could
---
