---
id: req-query
type: requirement
statement: The engine shall answer read queries over the loaded graph.
---
## Statements
1. The engine shall run a pinned Bases expression over nodes, edges, states, and notes.
2. The query lane shall return filtered rows with chosen fields.
3. quack mcp shall expose the query as a read-only tool.
4. If a query names an unknown field or kind, then the engine shall refuse with the field list.

The read twin of the apply lane. Structured answers replace file dumps and shell greps.
The evaluator is the pinned Bases subset the pooled queries already use. No second engine.
