---
id: se.req-state-inherit
kind: requirement
statement: When a machine state targets a product-level artifact that already exists as a ledger node, the work packet shall instruct sufficiency-check-and-amend, and an inherit evidence (pointer plus delta, or unchanged) shall satisfy the state.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Every iteration re-drafts product truth; the book loses its single source and the vision drifts per iteration.
req_kind: functional
verify_method: test
source_refs:
  - se.vision
  - se.context
  - se.stakeholders
---


