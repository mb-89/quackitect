---
id: req-battery-fail-at-end
type: requirement
statement: The battery shall run its whole scope and report every failure at the end.
---
## Statements
1. The battery shall run every test in scope before reporting.
2. The battery shall list every failure in one report.
3. If any test failed, then the battery shall exit nonzero once, at the end.

The owner law behind it: discover once, fix batched, confirm once. The i24 closing took six discovery runs because the battery aborted at the first failure.
