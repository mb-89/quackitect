---
id: report-frame
statement: Problem and success for the report are stated — v0 exposes only a flat DASHBOARD.md and has no shareable, audit-grade snapshot of the gate ledger; done-well = `quack report` emits ONE self-contained report.html that renders the ledger as the three-column view (iterations · trace-graph · metrics), self-certifies the ledger state via the Merkle root, opens offline, and needs no Obsidian.
depends_on: []
class: review
killer: true
---

## Rationale (not load-bearing)
L1/Frame. The report is a deterministic SNAPSHOT, not a live dashboard — snapshot semantics
(fixed value, Merkle-root self-certification) are what make it auditable and attachable to a
gate as evidence. Design reference: design/dashboard_draft.md.
