---
id: se.req-phone-bless
kind: requirement
statement: When the answer watcher reads a tap whose correlation id matches the live offer hash, the engine shall record a grant with channel=phone and adjudicated_by=owner, bound to that hash, and dismiss the offer.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: A from-away tap produces no grant - adjudication from the phone is impossible.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p2
---


