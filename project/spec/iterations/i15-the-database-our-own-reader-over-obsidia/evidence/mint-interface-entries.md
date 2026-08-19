---
form: mint-interface-entries
by: agent
signed_off: 2026-08-19T19:41:31.909Z
authors: agent
files:
---

# Evidence form / mint-interface-entries

## current_situation

se_query and se_couplings are both registered, tested, and reachable, but each is a crossing from the walk engine to a new element -- exactly the shape if-agent-harness-to-entrypoint documents for the harness boundary -- and neither had its own interface entry yet.

## built

project/spec/trace/interface/if-walk-engine-to-query-evaluator.md and if-walk-engine-to-coupling-disposer.md, both minted_in i15, source el-walk-engine, matching if-agent-harness-to-entrypoint's own shape (source, destination, carries, form, bound). Each names the flows it carries: the query evaluator's request/result/refusal, and the coupling disposer's change-description/candidate-list/disposition. dsp-lane-door.md's realizes list carries both ids. tests/trace-coverage.test.ts's three previously-red assertions (verb count 36 vs 38, se_couplings/se_query unnamed in trace, unnamed in a use case) are all green -- the count is pinned at 38, and uc-query-the-corpus-by-structure.md / uc-dispose-of-a-candidate-coupling.md both name the verbs explicitly.

## follow_up

All 5 build chunks and the interface entries are now built. Remaining: re-walk trace-design/verification, then re-fill gate-implementation with a defensible verdict (the bless is the coordinator's, not mine).

## anything_else

