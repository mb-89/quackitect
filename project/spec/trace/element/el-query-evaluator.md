---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: el-query-evaluator
type: "[[element]]"
statement: Answers a structured query over the trace corpus — a node kind, a filter and a field list in, matching rows or an explicit empty result out.
kind: new
realization: make
group: the-query
implements:
  - fn-run-a-governed-walk.answer-a-structured-query
source_refs:
  - raid-dec-i15-query-answers-via-declarative-view-spec
  - opt-declarative-view-spec-evaluated-in-process
  - cand-explicit-and-safe
---

## What it does

Parses the pinned subset's declarative filter shape (`filters.and`,
optionally nested `or`) plus a requested field list, walks the loaded
trace corpus fresh on every call — no cache, no separate index — and
returns matching rows carrying exactly the requested fields, or an
explicit empty result. An unknown field refuses, naming the legal field
list for that node kind.

## What crosses its boundary

Both flows cross the system boundary directly: flow-query-request in
from the caller, flow-query-result and flow-refusal out. No interface is
owed to any existing element — this is a new, direct external surface
(cluster-the-query's own `same-external-interface` coupling reason),
parallel to se_file_search/se_file_glob rather than routed through
el-walk-engine's dispatch.

## Realization concept

A small filter-expression evaluator (probed this iteration: 177.9µs for
4 nodes×2 queries, closed to `field == "value"` and `field != value`)
plus a field-list projector, reading the same trace corpus files every
existing element already reads without a modeled interface.
