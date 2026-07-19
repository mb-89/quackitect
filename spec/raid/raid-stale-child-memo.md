---
id: raid-stale-child-memo
type: raid
kind: risk
probability: 0.7
impact: 0.4
status: open
statement: The resident MCP child caches coverage memos, so a spec change after its boot yields stale ledger reads until the child restarts.
mitigation: Finish ledger-writing verifies before consulting MCP reads; restart the child at need; the engine fix clears the memos on spec change.
owner: engine maintainer
---
## Rationale (not load-bearing)
Observed twice in the i0027 M6/M7 walk (2026-07-19): a fresh-process verify recorded pass while the resident child kept reporting the pre-fix fail, costing a harness reconnect each time. The memo-lifetime defect note from i0027 b3 names the mechanism.
