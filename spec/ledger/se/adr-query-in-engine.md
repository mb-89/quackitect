---
id: se.adr-query-in-engine
kind: decision
statement: "quack query runs the pinned in-engine Bases subset. It reads nodes, edges, states, and notes. It returns filtered rows with chosen fields. It refuses an unknown field with the field list. The MCP surface serves it read-only. Datum: the Obsidian CLI as an external evaluator. It loses on the trust chain and the one-binary law. Conformance fixtures guard subset drift. The subset extends test-first. Reverse-sensitivity: a needed query beyond the subset re-opens this decision."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0024_hygiene
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: agent-proposal - architecture, shapes query_tool and query_evaluator
v2_amendment: se.get.query, TS reimplementation, same refusal semantics
---

## v2 amendment (applied at mint)

se.get.query, TS reimplementation, same refusal semantics
