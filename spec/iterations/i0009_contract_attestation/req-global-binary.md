---
id: req-global-binary
type: requirement
statement: When the launcher runs, it shall invoke the global quack binary from the user-local bin directory, building it from the workspace's vendored engine source when absent.
depends_on: []
class: review
killer: true
phase: [commissioning]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
The launcher stays dumb (fixed path, no hash computation). Vendored source gets a non-.quack home (fixed at M4); the dogfood repo's source IS product/engine-go.
