---
id: test-trace-nesting
type: test
statement: The report renders a third nesting level — build steps under a build parent, tests under a testing parent — and engage seeds subtasks under those parents.
class: executed
verify: selftest:report-nesting
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test over the render hierarchy.
