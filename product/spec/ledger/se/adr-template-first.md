---
id: se.adr-template-first
kind: decision
statement: "Every rendering fix lands template-first in the substrate. The spec re-derives, and book-drift gates the sync. Rejected: patching the dogfood book directly, since it forks template and spec."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0014_doc_review
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
owner directive 2026-07-07: template and spec stay in sync
