---
id: req-fresh-product-starts-empty
type: "[[requirement]]"
statement: When a newly scaffolded product is opened for the first time, its front desk shall present an empty machine, with zero records, notes, or backlog inherited from any other product.
kind: functional
verify_method: test
breaks_if_removed: A new product opens carrying another product's leftovers, and its record is polluted from birth.
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 7
priority: should
---
