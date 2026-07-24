---
id: se.req-schema-refuse
kind: requirement
statement: When an apply op writes a kind, field or enumerated value outside the node kind's declared vocabulary, the lane shall refuse and name the vocabulary; pre-vocabulary content is grandfathered with recorded markers.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: The mint accepts invented values silently - the recorded i2g incident class stays open.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-6
---


