---
id: bud-cold-start
type: budget
statement: The engine's cold start stays within its latency budget.
metric: cold-start
unit: ms
rule: max
margin: 0.5
allocations:
  engine_startup: 1000
---
The target is the allocation. The cap derives from the margin: 1000 over (1 minus 0.5) is 2000. The floor sits near 500ms from the AV scan.
