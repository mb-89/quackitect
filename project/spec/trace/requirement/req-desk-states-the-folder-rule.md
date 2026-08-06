---
id: req-desk-states-the-folder-rule
type: "[[requirement]]"
statement: "When asked to begin a product or asked for a product picker, the front desk shall state the folder rule."
kind: functional
verify_method: demonstration
breaks_if_removed: "The person hunts for a picker that does not exist and distrusts the folder model."
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 2
  - uc-begin-a-product ext 2a
priority: could
---

## Detail

The folder rule: a product is a folder holding everything it owns. Inside
the running product the desk presents zero picker affordances.
