---
id: req-selftest-home-sweep
type: requirement
depends_on: []
statement: When the selftest battery finishes, the engine shall remove the data homes of its fixture workspaces.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [maintainability]
---
## Rationale (not load-bearing)
241 orphaned fixture data homes accumulated under LOCALAPPDATA/quackitect.
