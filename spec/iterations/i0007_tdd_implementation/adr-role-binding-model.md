---
id: adr-role-binding-model
type: adr
addresses: [req-role-seam]
adjudicated_by: human
statement: Roles bind through a file-based Strategy interface with inline as the default; chosen over a multi-agent orchestration framework (Berkeley MAST evidence: coordination overhead, verifier rubber-stamping ~21pct of failures). Files are the durable handoff.
depends_on: []
class: review
killer: true
---
