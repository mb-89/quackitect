---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-declarative-view-spec-evaluated-in-process
type: "[[option]]"
statement: store the query as a declarative YAML view spec (filter + field list), evaluated against the loaded corpus in-process
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: prior-art
source: "Obsidian Bases, core plugin (help.obsidian.md/bases; confirmed via the Aug 2026 Obsidian changelog: formula editor, sort filters, table views with columns); v1's own 25 harvested .base files at ref main, e.g. spec/queries/requirements.base (filters.and, views.sort, views.groupBy)"
---

## Mechanism

The query is DATA, not code: a YAML document naming a filter expression
(optionally nested with `and`/`or`) and the fields a view wants back. An
evaluator walks the loaded corpus once, applies the filter, and projects the
named fields.

v1 already committed to this shape for all 25 of its harvested queries —
`spec/queries/requirements.base` at ref main filters on `type == "requirement"`
and asks for `[name, statement, kind]`, sorted and grouped. Continuing it
costs nothing new to learn; it costs a parser and an evaluator, both already
scoped by the pinned subset and adr-query-in-engine.
