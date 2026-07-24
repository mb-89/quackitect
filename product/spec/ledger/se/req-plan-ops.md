---
id: se.req-plan-ops
kind: requirement
statement: When plan ops insert or renumber planned iterations, the engine shall apply them atomically; renumbering a started iteration shall be refused.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Plan surgery stays hand-edited JSON - today's trace-book insertion renumbered four iterations by hand.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-3
---


