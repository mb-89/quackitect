---
id: test-trace-filter
type: test
statement: The rendered report exposes one filter box that accepts iteration predicates and text-or-regex terms combined with AND and OR, shows help on focus, and re-layouts the visible subgraph on change. The determinism root is unchanged by any filter interaction.
verifies: [req-trace-filter]
class: executed
verify: selftest:report
killer: false
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the single filter box lands in the report shell. Asserts the box, the regex path, and the client-side relayout. Determinism is covered separately by test-parity-golden over the data root.
