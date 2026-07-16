---
id: adr-template-first
decided_in: i0014_doc_review
type: adr
kind: architecture
adjudicated_by: user
statement: Every rendering fix lands template-first in the substrate. The spec re-derives, and book-drift gates the sync. Rejected: patching the dogfood book directly, since it forks template and spec.
class: review
killer: false
---
## Rationale (not load-bearing)
owner directive 2026-07-07: template and spec stay in sync
