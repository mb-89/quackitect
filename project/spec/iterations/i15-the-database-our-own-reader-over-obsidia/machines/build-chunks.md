---
steps:
  - id: build-query-evaluator
    statement: Implement the real filter-expression evaluator in engine/query.ts, replacing the throwing stub, so tests/query.test.ts's four cases go green.
    depends_on: []
    realization: software
  - id: build-coupling-disposer
    statement: Implement BM25 ranking and the disposition-row writer in engine/disposition.ts, replacing the throwing stub, so tests/coupling-rank.test.ts's two cases go green and tsp-coupling-disposition's checklist is inspectable.
    depends_on: []
    realization: software
  - id: wire-lane-tools
    statement: Register se_query and se_couplings as lane tools (engine/tools-query.ts), wired to answerStructuredQuery and rankCandidateCouplings/recordCouplingDisposition, so the goal's served-over-the-tool-surface line is true rather than only the underlying functions existing.
    depends_on:
      - build-query-evaluator
      - build-coupling-disposer
    realization: software
  - id: harvest-v1-queries
    statement: Copy the 25 .base query files from spec/queries/ at ref main into this tree's spec/queries/, plus spec/decisions/adr-query-in-engine.md, using se_git/se_run once legal.
    depends_on: []
    realization: software
  - id: conformance-fixtures
    statement: Add conformance fixtures pinning the supported Bases subset against drift, alongside the existing tests/fixtures/*.base, exercising se_query against the harvested shapes.
    depends_on:
      - wire-lane-tools
      - harvest-v1-queries
    realization: software
  - id: fix-delta-default-resolvers
    statement: Rewrite the $-item resolvers so they default to the bound record's own minted_in delta, with an explicit opt-in to widen to the whole corpus, per raid-debt-delta-default-views's Repayment section — the coverage laws stay corpus-wide.
    depends_on: []
    realization: software
  - id: mint-interface-entries
    statement: Author the two interface entries se_query and se_couplings owe (if-agent-harness-to-entrypoint's siblings), once both verbs are registered and tested.
    depends_on:
      - wire-lane-tools
    realization: software
---
