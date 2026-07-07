---
id: req-migrate-edges
type: requirement
depends_on: []
statement: When quack migrate-edges runs, the engine shall convert every frontmatter edge to the connections home, shall refuse on a duplicate edge entry or a before-and-after adjacency mismatch, and shall write the edges mode flag last.
class: review
killer: false
phase: [migration]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Self-auditing one-shot (migrate-actors precedent): the golden re-baseline at migration would otherwise bake migration bugs invisibly (red-team finding 3/4). depends_on/parent inclusion is the M4 taste call; implements stays code-declared.
