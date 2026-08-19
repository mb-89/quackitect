---
form: gate-implementation
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

verification signed: two specs observed green by fresh eyes (tsp-coupling-disposition, tsp-read-back-inspection), 17 owed against open register entries this delta does not touch. gate-implementation is fresh, never signed. Checking the actual build against record.md's DONE LOOKS LIKE line and the seven kickoff goals before judging.

## quality_ok

- [x] Dependencies stay layered — engine/query.ts and engine/disposition.ts each import only trace.ts, no new cross-layer edge.
- [x] Every new element carries one stated responsibility — query.ts answers structured queries, disposition.ts ranks and records couplings, cleanly split.
- [owed] The linter and the complexity ceiling are clean, with no new suppression — raid-debt-i15-gate-implementation-reached-with-five-goals-unbuilt
- [x] Every new behavior carries its check, and the battery is green at rest — tests/query.test.ts and tests/coupling-rank.test.ts exist and, per verification's fresh-eyes read, both stubs are now real.
- [x] Nothing speculative shipped — both files implement exactly what their test-specs demand, nothing beyond.
- [x] What changed is findable — engine/query.ts and engine/disposition.ts are two new files, cited by their design specs and test specs.
- [owed] Every quick-and-dirty taken stands as a visible raid debt entry — raid-debt-i15-gate-implementation-reached-with-five-goals-unbuilt

## debt_taken

- raid-debt-i15-gate-implementation-reached-with-five-goals-unbuilt

## risks_acceptable

not-acceptable — the goal is not yet served; see round_1_validate. Shipping past this gate would mean blessing an iteration whose own kickoff goals are five-sevenths unmet.

## round_0_verify

- evidence vs claims: FAIL — engine/query.ts and engine/disposition.ts exist and are real (not stubs, confirmed by verification's fresh-eyes read and by reading query.ts directly), but neither is imported by any tool-registration file. se_file_search for the tool-name pattern (se_query, se_bm25, se_dispose) against project/deliverable/engine/tools*.ts returns zero matches. The functions exist; the lane verbs record.md's DONE LOOKS LIKE line demands do not.
- types: not run this session
- lint: not run this session
- tests: tests/query.test.ts and tests/coupling-rank.test.ts exist and, per verification's read, their stubs are now real implementations — but I have not run se_test myself to confirm green at rest.

## round_1_validate

- exercised against the goal: FAIL. record.md's DONE LOOKS LIKE line names a served, callable verb; what exists is the underlying function, unreachable from the lane's tool surface.
- missing: the query verb and BM25 verb are not registered as lane tools (se_file_search for se_query/se_bm25/se_dispose against tools*.ts returns zero matches); the 25 .base harvest never ran (spec/queries/ absent from this tree); the subset extension is contingent on the harvest; conformance fixtures pinning the subset are not written; raid-debt-delta-default-views's resolver rewrite has no code change; neither verb has an interface entry.
- wrong: nothing built contradicts the design; the gap is completeness, not correctness.
- out of scope: unchanged from gate-kickoff — the dashboard, embeddings, book table-interactivity, and mirror-widget UI changes beyond the verb/subset.
- prior art: not re-exercised here; find_prior_art already ran a live search this session and nothing has changed since.

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: PARTIAL — the underlying function exists and is tested (engine/query.ts, tests/query.test.ts), but it is not registered as a callable se_ lane tool. Not served.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: NOT SERVED — spec/queries/ does not exist in this working tree; the harvest never ran.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: NOT SERVED — contingent on the harvest, which has not happened.
- Add conformance fixtures that pin the subset against drift.: NOT SERVED — no fixture files found beyond the pre-existing tests/fixtures/*.base named at gate-kickoff.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: NOT SERVED — no resolver-default code change found; the raid entry's own status is unchanged.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: PARTIAL — ranking and disposition-recording functions exist and are tested (engine/disposition.ts, tests/coupling-rank.test.ts), but not registered as a callable se_ lane tool. Not served.
- Mint the interface entries both new lane verbs owe.: NOT SERVED — no interface entries exist for either verb; neither verb exists yet to own one.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since gate-kickoff last signed.

## round_2_red_team

- steelman: the two chunks the seeded build-chunks machine actually planned (build-query-evaluator, build-coupling-disposer) are both done and tested green per verification's own fresh-eyes read; judged only against what was PLANNED, M7 succeeded completely => but the plan itself is the gap: specify-build seeded only the two internal-logic chunks and never seeded chunks for tool registration, the harvest, conformance fixtures, the resolver-default fix, or the interface entries — five of the kickoff's seven goals were never turned into build-chunk work at all, so judging only against the seeded plan launders the real gap through a plan that undersized itself; kill criterion: if the missing five were always meant to land in a later iteration rather than this one, this verdict is wrong and record.md's own scope framing needs re-reading before failing this gate — checked: record.md's DONE LOOKS LIKE line and gate-kickoff's own goals list both name all seven as this iteration's own scope, with no forward reference to a later iteration for any of them, so the kill criterion does not fire
- is fail too harsh given change_size was major and two of seven goals show real, tested progress => no: risks_acceptable's own test is whether the goal is served, not whether effort was spent; a major that ships two of seven goals is a major still substantially undone, and the honest answer is fail with the gap named precisely enough that specify-build can be reopened to seed the missing chunks rather than the iteration quietly closing on partial delivery

## raid_additions

- raid-debt-i15-gate-implementation-reached-with-five-goals-unbuilt

## verdict

fail — two of the kickoff's seven goals (the query-answering logic, the BM25 ranking/disposition logic) are built and tested; the other five (lane-tool registration for both verbs, the harvest, the subset-extension groundwork, conformance fixtures, the resolver-default fix, and both interface entries) were never seeded as build-chunk work and remain undone. record.md's own DONE LOOKS LIKE line names a served, callable verb — what exists is the function underneath one.

THIS IS THE GATE ABOVE THIS SESSION'S AUTONOMY. I am filling it honestly and stopping here rather than blessing my own incomplete work. The remedy is mechanical: reopen specify-build, seed chunks for tool registration (wiring engine/query.ts and engine/disposition.ts to se_ tool names), the harvest (copying spec/queries/ and the ADR from ref main), the resolver-default rewrite, conformance fixtures, and the two interface entries, then re-walk build-steps through this gate again.

## follow_up

ON REOPENING specify-build: five chunks are owed, none seeded yet.

1. Register se_query (or equivalent name) as a lane tool wired to engine/query.ts's answerStructuredQuery, and se_bm25/se_couple (naming is this chunk's to decide) wired to engine/disposition.ts.
2. Harvest: copy the 25 .base files from spec/queries/ at ref main into this tree's spec/queries/, plus spec/decisions/adr-query-in-engine.md, using se_git/se_run once legal at the harvesting state.
3. Extend the pinned Bases subset test-first, only where a harvested query needs it (contingent on step 2).
4. Add conformance fixtures pinning the subset against drift, alongside the existing tests/fixtures/*.base.
5. Fix raid-debt-delta-default-views: rewrite the $-item resolvers to default to the bound record's minted_in delta, opt-in to widen to the corpus.
6. Mint the two interface entries once both verbs are registered.

The two chunks already built (query-answering, BM25 ranking/disposition) need no rework — they are real, tested, and verified green by fresh eyes. They are the foundation the five new chunks build on, not a redo.

## anything_else

Filled and saved, not submitted — verdict is fail, and blessing (or ruling on a failing gate) is the person's call above this session's autonomy.
