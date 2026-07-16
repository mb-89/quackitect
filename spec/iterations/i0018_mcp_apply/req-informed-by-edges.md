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
2. When the book renders an informed-by list, the renderer shall list every decision holding a first-class edge to the model or its elements, and shall keep a name-derived citation only for a decision without a first-class edge.
3. If an addresses edge names a model element that no model declares, then quack lint shall flag the dangling target.
