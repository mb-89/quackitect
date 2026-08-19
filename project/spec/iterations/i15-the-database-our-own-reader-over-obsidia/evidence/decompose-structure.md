---
form: decompose-structure
reopened: "2026-08-19T17:39:10.916Z — same claims-registration gap, cascading fix through M5"
by: agent
signed_off: 2026-08-19T17:39:11.254Z
authors: agent
files: null
---

# Evidence form / decompose-structure

## current_situation

record-adrs closed. The winner's two picks each become one new element, following the same grouping as their function clusters. Neither's flows cross into an existing element's boundary, so no interface is owed.

## elements

- el-query-evaluator
- el-coupling-disposer

## allocation

- fn-run-a-governed-walk.answer-a-structured-query: el-query-evaluator
- fn-run-a-governed-walk.rank-candidate-couplings: el-coupling-disposer
- fn-run-a-governed-walk.record-a-coupling-disposition: el-coupling-disposer

## follow_up

Both new functions land on elements already written with implements/source_refs set. No owed interface: flow-query-request/result/refusal and flow-change-description/coupling-disposition all cross the system boundary directly, and flow-candidate-list stays internal to el-coupling-disposer since both its producer and consumer sit on the same element. trace_complete should show every i15 requirement reached transitively through this chain.

## anything_else

