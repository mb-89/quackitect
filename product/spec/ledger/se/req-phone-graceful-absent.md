---
id: se.req-phone-graceful-absent
kind: requirement
statement: When no phone config is present, the phone lane shall stay silent - no publish attempt, no watcher, no error - and every other channel shall work unchanged.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: An unconfigured install crashes or spams; the lane must be strictly opt-in.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p1
---


