---
id: se.req-phone-transport-injectable
kind: requirement
statement: The phone lane shall publish and read through an injectable transport interface so a mock stands in for ntfy in tests and no live topic is contacted during a build.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: Every test would hit the real network; an unattended build could fire real pushes.
req_kind: constraint
verify_method: test
source_refs:
  - se.raid-answer-forgery
---


