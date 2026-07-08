---
id: adr-template-first
type: adr
kind: architecture
adjudicated_by: user
statement: Every rendering fix lands template-first in the substrate; the spec re-derives and book-drift gates the sync. Rejected: patching the dogfood book directly - it forks template and spec.
class: review
killer: false
---
## Rationale (not load-bearing)
owner directive 2026-07-07: template and spec stay in sync
