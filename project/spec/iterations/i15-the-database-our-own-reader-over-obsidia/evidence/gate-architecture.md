---
form: gate-architecture
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:42:22.001Z
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

pass — zero interface debt, zero idle elements, zero unimplemented functions at decompose-structure; all quality scenarios ruled at evaluate-architecture, one at-risk finding (real-scale query timing) correctly minted rather than hidden. The corpus-drift scenarios found this session were verified against actual code before being ruled, not assumed.

## follow_up

M6/M7 inherit: the req-call-answers-in-one-second risk against el-query-evaluator's real-scale timing, the req-broken-trace-is-a-defect gap carried since gate-candidates, and the narrow-grammar timing question parked at evaluate-set. Next: M6's spike stage, if the pin's change size calls for it, then M7 build.

## anything_else

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: nothing yet — m7 owns the build; m5 decomposed the winning candidate's structure (zero interface debt, zero idle elements) and evaluated it against the quality scenarios, an at-risk finding on real-scale timing minted this milestone.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: nothing yet — still owed at the harvesting sub-step.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: nothing yet — m5/m6 own it.
- Add conformance fixtures that pin the subset against drift.: nothing yet — m7 (author-tests) owns it.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: nothing yet — m7 owns the resolver-default rewrite.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: nothing yet — m5 recorded the deciding ADR (raid-dec-i15-query-answers-via-declarative-view-spec) that both verbs build against; m7 owns the build.
- Mint the interface entries both new lane verbs owe.: nothing yet — owed once the verbs exist.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since gate-kickoff last signed; M5 states used file/read/write/search tools only.
