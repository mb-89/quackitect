---
id: se.raid-no-op-adds-a-section-to-a-node
kind: raid
statement: "A freshly created ledger node has NO sections, and replace_section refuses a section that does not exist (SE-C-015) - so there is no way to give a new node a structured body through the lane. Everything must be crammed into the statement field. Logged as an se_help miss on 2026-07-24 ('add new section body to ledger node: fresh nodes need Guidance and Evidence form sections, replace_section refuses on missing section'), never built, and it bit again at i12 while porting v1's review rubric."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now; second occurrence. Fix: an add_section op (or replace_section creating when absent), so a node can be authored with the body shape its kind expects - machine_state nodes need Guidance and Evidence-form sections, method nodes need Situation/Procedure/Effect. Until then, statements carry structure they were not meant to carry, which also inflates every packet that resolves them."
---


