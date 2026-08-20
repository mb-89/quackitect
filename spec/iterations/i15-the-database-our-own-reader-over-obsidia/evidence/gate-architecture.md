---
form: gate-architecture
bless: blessed by agent
by: agent
signed_off: 2026-08-16T18:26:25.734Z
authors: agent
files: null
---

# Evidence form / gate-architecture

## current_situation

evaluate-architecture closed: 25 scenarios ruled (24 addressed, 1 at risk), 8 fitness candidates flagged, structure numbers clean.

## round_0_verify

- evidence vs claims: all 25 scenarios carry [[req-id]] verdicts the engine's own deckLawProblems check confirms are zero unruled; the element matrix, Pugh card and sensitivity deck are all engine-computed, never typed
- types: interface debt 0, idle elements 0, unimplemented functions 0, allocation spread 5 (all five pre-existing, none from i15), two-way pairs 1 (pre-existing, el-record-store⇄el-test-runner), undemanded interfaces 1 (pre-existing, if-core-satellite)
- lint: no TBD/TBC/"???" markers anywhere in the new elements, ADRs or the walk
- tests: not applicable at this M5 gate; the build's own tests are M7's

## round_1_validate

- exercised against the goal: the winner (cand-explicit-and-safe) is now a real structure — two new elements, three functions allocated, zero owed interfaces, every i15 requirement reachable through the trace chain
- missing: nothing found beyond the already-carried req-broken-trace-is-a-defect gap and the one at-risk finding this gate's own walk surfaced
- wrong: none found — the two new elements match their clusters' own DSM coupling exactly (same-external-interface → one element each, sequence → shared element for rank+record)
- out of scope: el-record-store, el-mirror and the rest of the standing system are untouched, correctly — i15's cone is the two new clusters alone
- prior art: Obsidian Bases and Dataview both name the same no-cache-or-cache tradeoff el-query-evaluator and cand-fast-path-plus-blocking's rejected alternative embody; no candidate claimed to beat either outright

## round_2_red_team

- composer bias in decompose-structure => the element split (one per cluster) is checkable against the DSM's own coupling classes computed at M4, not a preference call made now
- a real risk minted, not waved through => req-call-answers-in-one-second's at-risk verdict stands on the record as a register risk, carrying the winner's own unmeasured-at-scale gap into M6/M7 rather than closing it with an unearned addressed
- the shared-mechanism trap from evaluate-set => cand-narrow-grammar-plus-explicit's disputed timing score did not change which candidate won, so it does not need resolving before this gate, only before M5 revisits candidates it already eliminated

## raid_additions

- none

## verdict

pass — the structure numbers are clean, the one at-risk finding is on the register rather than silently passed, and the decomposition traces cleanly to the DSM coupling computed three states earlier; M7 builds inside this baseline

## follow_up

M6/M7 inherit: the req-call-answers-in-one-second risk against el-query-evaluator's real-scale timing, the req-broken-trace-is-a-defect gap carried since gate-candidates, and the narrow-grammar timing question parked at evaluate-set. Next: M6's spike stage, if the pin's change size calls for it, then M7 build.

## anything_else

