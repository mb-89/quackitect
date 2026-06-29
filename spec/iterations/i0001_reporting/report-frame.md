---
id: report-frame
statement: The problem and success for the report are stated. v0 exposes only a flat DASHBOARD.md. It has no shareable, audit-grade snapshot of the gate ledger. Done-well: quack report emits ONE self-contained report.html. It renders the ledger as the three-column view (iterations, trace-graph, metrics). It self-certifies the ledger state via the Merkle root. It opens offline. It needs no Obsidian.
depends_on: []
class: review
killer: true
---

## Rationale (not load-bearing)
L1/Frame. The report is a deterministic SNAPSHOT, not a live dashboard — snapshot semantics
(fixed value, Merkle-root self-certification) are what make it auditable and attachable to a
gate as evidence. Design reference: design/dashboard_draft.md.
