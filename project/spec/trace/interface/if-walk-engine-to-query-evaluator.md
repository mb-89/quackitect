---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: if-walk-engine-to-query-evaluator
type: "[[interface]]"
statement: se_query, the lane door, hands a .base file and a view name to the query evaluator and gets back the view's own matching rows, projected to its own column order.
source: el-walk-engine
destination: el-query-evaluator
carries:
  - flow-query-request
  - flow-query-result
  - flow-refusal
form: direct function call, in-process
bound: 1 second
source_refs:
  - if-agent-harness-to-entrypoint
  - dsp-query-evaluator
  - dsp-lane-door
---

THE SEAM MADE REAL. el-query-evaluator existed as an island since M5 (dsp-query-evaluator names no interface), reachable by nothing outside its own test. engine/tools-query.ts's se_query is the first and only caller, so this is the crossing that makes the goal's "served read-only over the tool surface" line true rather than aspirational.

## What crosses

- the request: a vault-relative .base path, an optional view name, an optional field-order override (flow-query-request)
- the result: rows projected to the view's own declared column order (flow-query-result)
- a refusal, typed, when the named view or a requested field does not exist (flow-refusal)

## Why the bound is inherited rather than measured fresh

This crossing happens entirely inside the same process if-agent-harness-to-entrypoint already bounds at one second. No new host, no new transport — the query evaluator is called the same way any other tool handler runs. A separate measurement would time the same call twice.
