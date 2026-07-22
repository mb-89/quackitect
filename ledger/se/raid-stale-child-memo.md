---
id: se.raid-stale-child-memo
kind: raid
statement: The resident MCP child caches coverage memos, so a spec change after its boot yields stale ledger reads until the child restarts.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  p3_status: post-p3-addition
v1_type: raid
v1_kind: risk
v1_probability: 0.7
v1_impact: 0.4
v1_status: open
v1_mitigation: Finish ledger-writing verifies before consulting MCP reads; restart the child at need; the engine fix clears the memos on spec change.
v1_owner: engine maintainer
---

## Rationale (not load-bearing)
Observed twice in the i0027 M6/M7 walk (2026-07-19): a fresh-process verify recorded pass while the resident child kept reporting the pre-fix fail, costing a harness reconnect each time. The memo-lifetime defect note from i0027 b3 names the mechanism.
