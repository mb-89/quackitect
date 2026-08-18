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
---
