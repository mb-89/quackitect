---
id: req-desk-takes-plain-words
type: "[[requirement]]"
statement: "When a person states wanted work at the front desk, the desk shall accept it as free text and shall demand no format of the person."
kind: functional
verify_method: demonstration
breaks_if_removed: "The person composes paperwork instead of saying a sentence and the desk's promise fails."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 1
  - stk-engineer-driving-agents
priority: must
---
