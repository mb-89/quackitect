---
id: req-binary-budget
type: requirement
statement: The build shall check the binary against its budget nodes.
---
## Statements
1. The build shall check binary size and cold start against their budget nodes.
2. If a measure exceeds its target, then the build shall warn.
3. If a measure exceeds its hard cap, then the build shall refuse.

Owner ruling 2026-07-15: size target 25MB and cap 35MB. Cold start target 1000ms and cap 2000ms.
