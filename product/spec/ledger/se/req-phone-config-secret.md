---
id: se.req-phone-config-secret
kind: requirement
statement: The phone lane shall read its topic and any token only from an owner-provided config file, and shall never write the secret to any log or committed file.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: The credential could leak into the call log or the repo; the agent could be pushed to mint or enter it.
req_kind: constraint
verify_method: inspection
source_refs:
  - se.stakeholders
---


