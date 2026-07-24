---
id: se.req-phone-publish
kind: requirement
statement: When a gate creates an offer and the phone lane is configured, the engine shall publish the offer brief and a bless action to the paired topic, carrying the offer hash as the correlation id.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: Offers never reach the phone - the whole lane is inert.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p1
---


