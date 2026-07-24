---
id: se.req-projection-verify
kind: requirement
statement: The boot handover's last_verify shall be selected by timestamp across all iterations, never by directory order.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: An abandoned iteration's stale red overwrites the latest green in the handover - witnessed with i2c.
req_kind: quality
verify_method: test
source_refs:
  - se.uc-9
---


