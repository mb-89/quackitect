---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:47:11.814Z
authors: agent
files: null
---

# Evidence form / gate-prototype

## current_situation

gate-prototype reviews i15's one seeded spike before M7 build starts. The spike (exp-i15-query-latency-at-real-corpus-scale) has already run and folded back.

## buildable

yes — the seeded spike holds with a 32x margin under the one-second bound; nothing else blocks build.

## round_0_verify

- evidence vs claims: the exp- node's measured (31 ms, 768 files) matches what the register entry now carries — claim and evidence agree
- types: no product code changed this milestone (spec/markdown only, pre-M7) — nothing to typecheck yet
- lint: same — no code shipped yet, nothing to lint
- tests: none run — the spike's script was throwaway and unshipped, no test file exists to run

## round_1_validate

- exercised against the goal: the spike tested exactly req-call-answers-in-one-second at real scale, which is M6's whole purpose — derisk before committing to build
- missing: nothing else was seeded; rank-unknowns explicitly excluded the design-gap risk and the two losing-candidate tripwires, with its reasoning on record in evidence/rank-unknowns.md
- wrong: no finding contradicts a standing claim — the measurement confirmed the design assumption rather than overturning it
- out of scope: the real filters.and/or evaluator is out of scope for a spike; that is named M7 build work on the experiment node's promote field
- prior art: none newly needed — the M4 prior-art scan already covered the query mechanism's design space

## round_2_red_team

- the corpus measured (768 files) doubles the ~328 everyone had been assuming, and the 32x margin still held, so scale is not the weak point here. => not a live risk
- the weakest remaining point is raid-risk-i15-broken-trace-defect-unaddressed-by-any-candidate, which stays open — no spike settles a design gap, M7 build work does. => carried forward, not blocking this gate

## raid_additions

- none

## verdict

pass — buildable, per the gate's own struck mechanics: the seeded spike (query latency at real corpus scale) left its experiment node and fold-back's submit already refused until every fold key was answered, so results-recorded is satisfied by construction. Assumptions-validated is read as data per this gate's own note that its shape is still under owner discussion.

## follow_up

none — proceeds to M7 build (specify-build).

## anything_else

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: nothing yet — m7 owns the build; m6 spiked the riskiest unknown (query latency at real corpus scale) and fold-back promoted its finding into the design rather than leaving it standing on a 4-node probe.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: nothing yet — still owed at the harvesting sub-step, first state where se_run/se_git are legal.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: nothing yet — m6/m7 own it.
- Add conformance fixtures that pin the subset against drift.: nothing yet — m7 (author-tests) owns it.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: nothing yet — m7 owns the resolver-default rewrite.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: nothing yet — m7 owns the build.
- Mint the interface entries both new lane verbs owe.: nothing yet — owed once the verbs exist.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since gate-kickoff last signed; M6 states used file/read/write/search/run tools.
