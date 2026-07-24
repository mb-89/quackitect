---
id: se.req-json-tree
kind: requirement
statement: When a detail surface shows structured data without a purpose-built renderer, the board shall render it as a collapsible tree - plain text is never the fallback for JSON.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: Gate details and log entries read as raw JSON - the owner named it twice in one day.
req_kind: interface
verify_method: inspection
source_refs:
  - se.uc-8
  - se.stakeholders
---


