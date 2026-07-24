---
id: se.req-offer-lane
kind: requirement
statement: When an offer's underlying machine state changes or its evidence is superseded, the agent surface shall provide dismiss and supersede; a re-offer against unchanged machine state shall replace the live offer.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Stale offers wedge gates for up to 6 hours; the machine keeps having no legal way to be wrong.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-2
  - se.uc-3
---


