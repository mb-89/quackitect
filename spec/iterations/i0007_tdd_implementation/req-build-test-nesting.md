---
id: req-build-test-nesting
type: requirement
refines: [uc-review-report]
statement: The report nests generated build steps under a single build parent (a third nesting level, collapsible, in dependency order), reflecting the real hierarchy. (Tests are trace content rolled up by the verification task — the trace/task separation supersedes the original "testing parent" idea.)
depends_on: []
class: review
killer: false
---
