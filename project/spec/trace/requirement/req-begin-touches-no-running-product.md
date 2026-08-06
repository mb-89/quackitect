---
id: req-begin-touches-no-running-product
type: "[[requirement]]"
statement: "While a new product is begun, the engine shall change zero files of any running product."
kind: functional
verify_method: test
breaks_if_removed: "Beginning something new endangers the product already running, so nobody dares begin."
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 3
priority: must
---
