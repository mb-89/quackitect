---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: dsp-query-evaluator
type: "[[design-spec]]"
statement: Answering a structured query, carried by a filter-expression evaluator reading the corpus fresh on every call.
realizes:
  - el-query-evaluator
files:
  - deliverable/engine/query.ts
---

## Responsibility

Evaluates `filters.and` (optionally nested `or`) against every node of a
named kind, projects the requested field list onto each match, and
returns rows or an explicit empty result. Refuses a request naming a
field the matched kind does not define, naming the legal fields.

Does NOT cache, index, or persist anything — raid-dec-i15-query-answers-via-declarative-view-spec
commits to a fresh read every call, with no separate storage layer.

## Interface

```ts
answerStructuredQuery(root: string, request: QueryRequest): QueryResult
```

- `QueryRequest` — `kind` (a node type), `filters.and` (a list of
  `{field, equals?, not_equals?}` clauses), `fields` (the requested
  field list).
- `QueryResult` — `rows`, each carrying exactly the requested fields as
  strings.
- Currently a stub: throws until build-steps replaces the body.

## Behavior and constraints

- Walks the loaded trace corpus for nodes of `kind`, applies every
  `and` clause (all must hold), then projects `fields` per matching
  row.
- An unrequested field never rides a row — the projection is exact,
  never a superset.
- A field absent from the matched kind's schema refuses before any row
  is built, naming the kind's legal fields (req-query-refuses-unknown-field).
- Zero matches returns `{ rows: [] }`, never `undefined` or an omitted
  response (req-query-empty-result-explicit).
- No write may land on the corpus between two calls this evaluator
  compares — determinism is a property of an unchanged corpus
  (req-query-is-deterministic), not a guarantee across a concurrent
  write.

## Rationale

opt-declarative-view-spec-evaluated-in-process, chosen at
raid-dec-i15-query-answers-via-declarative-view-spec: v1's own YAML
view-spec shape, evaluated in-process rather than through an external
CLI, a parser over an index, or an embedded relational store. The
probed mechanism (opt-closed-regex-grammar-for-filter-expressions,
177.9µs for 4 nodes×2 queries) and exp-i15-query-latency-at-real-corpus-scale
(31 ms over 768 real files) both measure the fresh-read shape as well
inside the one-second bound.
