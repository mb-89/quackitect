---
id: req-begin-touches-nothing-existing
type: "[[requirement]]"
statement: While a new product is begun, the engine shall change zero files of any existing product.
kind: functional
verify_method: test
breaks_if_removed: Beginning a second product damages the first, which is unrecoverable and unforgivable.
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 3
  - uc-begin-a-product ext 3a
  - uc-begin-a-product ext 5a
  - ".se/req-mine-v2.md: the loop and serving"
priority: must
---

## Detail

Each way the isolation binds:

- While a new product is begun, the engine shall change zero files of any running product.
- If the requested product folder already exists, then the engine shall refuse the scaffold, name the existing folder, and write zero files into it.
- While two products run at the same time, each product's engine shall serve only its own product, with zero calls of one product answered by the other's engine.
