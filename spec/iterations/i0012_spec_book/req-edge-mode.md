---
id: req-edge-mode
type: requirement
depends_on: []
statement: While spec/project.toml declares edges = connections, the engine shall refuse a legacy edge key in node frontmatter naming the file and key.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
The two-source interim needs a referee (red-team finding 7); the mode key is the migration's atomic commit point.
