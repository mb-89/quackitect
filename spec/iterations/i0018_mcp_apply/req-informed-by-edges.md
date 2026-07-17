---
id: req-informed-by-edges
type: requirement
depends_on: []
statement: The engine shall accept a decision edge to a model or model element first-class. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Where a decision addresses a model or a model element, the engine shall load that edge first-class, exactly as an edge to a requirement.
2. The engine shall derive no informed-by citation from name matching (narrowed by adr-s7f5mzi; the first-class addresses edge is the only informing lane).
3. If an addresses edge names a model element that no model declares, then quack lint shall flag the dangling target.
