---
id: req-root-marker
type: requirement
statement: When locating the workspace root, the engine shall walk up to the nearest directory containing spec/project.toml.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Replaces the .quack walk-up marker (decided 2026-06-30, superseded by the owner 2026-07-04). Committed truth, present in every quackitect repo by construction.
