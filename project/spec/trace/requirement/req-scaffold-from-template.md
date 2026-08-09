---
id: req-scaffold-from-template
type: "[[requirement]]"
statement: When the person begins a new product, the engine shall scaffold its folder from the product template, with every scaffolded file schema-valid and zero declared fields missing.
kind: functional
verify_method: test
breaks_if_removed: A hand-rolled product tree drifts from the schema, and the engine misreads or refuses it later.
breaks_how_badly: crippling
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 3
  - ".se/req-mine-v1.md: the lane — mediated I/O"
priority: should
weighs_against:
  - req-fresh-product-starts-empty >
---
