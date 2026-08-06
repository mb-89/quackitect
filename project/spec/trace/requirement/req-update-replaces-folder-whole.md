---
id: req-update-replaces-folder-whole
type: "[[requirement]]"
statement: "When a new engine version replaces the vendored folder whole, the product shall come up with zero merge operations and zero edits to builder-owned files."
kind: functional
verify_method: demonstration
breaks_if_removed: "Every engine update becomes a fork-and-merge, the exact cost the vendor path exists to remove."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 6
priority: should
---
