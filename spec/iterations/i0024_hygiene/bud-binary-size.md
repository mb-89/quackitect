---
id: bud-binary-size
type: budget
statement: The engine binary stays within its size budget.
metric: size
unit: MB
rule: max
margin: 0.29
allocations:
  quack_exe: 25
---
The target is the allocation. The cap derives from the margin: 25 over (1 minus 0.29) is 35.
