---
id: req-concurrent-engines-isolated
type: "[[requirement]]"
statement: "While two products run at the same time, each product's engine shall serve only its own product, with zero calls of one product answered by the other's engine."
kind: functional
verify_method: test
breaks_if_removed: "Two engines cross wires: one product's calls land in the other's log or machine."
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product ext 5a
  - ".se/req-mine-v2.md: the loop and serving"
priority: must
---

## Detail

## Detail

| axis | demand |
| --- | --- |
| port | each engine serves on its own port |
| log | each engine writes its own call log |
| calls | zero calls of one product answered by the other's engine |
| processes | an engine lists, stops and cycles only processes it owns; foreign ones are refused |
