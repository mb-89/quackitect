---
id: se.req-phone-dismiss-action
kind: requirement
statement: When a tap carries the dismiss action for the live offer, the engine shall dismiss the offer instead of blessing it.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: The owner could bless from away but never decline from away - a one-sided lane.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p2
---


