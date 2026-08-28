---
id: adr-query-in-engine
type: adr
decided_in: i0024_hygiene
adjudicated_by: user
statement: "quack query runs the pinned in-engine Bases subset. It reads nodes, edges, states, and notes. It returns filtered rows with chosen fields. It refuses an unknown field with the field list. The MCP surface serves it read-only. Datum: the Obsidian CLI as an external evaluator. It loses on the trust chain and the one-binary law. Conformance fixtures guard subset drift. The subset extends test-first. Reverse-sensitivity: a needed query beyond the subset re-opens this decision."
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal - architecture, shapes query_tool and query_evaluator
---
