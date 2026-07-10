---
id: req-adapter-zero-dep
type: requirement
depends_on: []
statement: The engine shall implement the ask loop and every channel adapter with the Go standard library only.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
The engine-wide zero-dep law extends to the adapters (go-rewrite decision, i3).
