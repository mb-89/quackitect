---
form: author-tests
reopened: 2026-08-19T17:50:18.541Z — same claims-registration gap, cascading fix through M7
by: agent
signed_off: 2026-08-19T17:50:18.960Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

gate-prototype cleared; M7 build begins. i15 mints 7 functional requirements (4 query, 3 BM25/disposition) with zero prior test coverage, plus reuses 6 pre-existing quality specs already covering i15's M4 scoring criteria.

## checks

- tsp-query-answers
- tsp-coupling-rank
- tsp-coupling-disposition
- tsp-bound-resolution
- tsp-trace-integrity
- tsp-derivation-analysis
- tsp-record-lifecycle
- tsp-engine-lifecycle
- tsp-served-instructions-name-their-act
- tsp-guidance-names-only-what-exists

## follow_up

Three new specs authored: tsp-query-answers and tsp-coupling-rank (method test, six red cases across tests/query.test.ts and tests/coupling-rank.test.ts, against throwing stubs engine/query.ts and engine/disposition.ts), and tsp-coupling-disposition (method inspection, checklist only, owed at verification once the real writer lands). specify-build plans the chunks that turn the stubs real.

## anything_else

