---
id: test-trace-nesting
type: test
statement: The report renders a third nesting level — build steps under a build parent, tests under a testing parent — and engage seeds subtasks under those parents.
verifies: [req-trace-nesting]
class: executed
verify: selftest:report-nesting
killer: false
---
## Rationale (not load-bearing)
New self-test over the render hierarchy.
