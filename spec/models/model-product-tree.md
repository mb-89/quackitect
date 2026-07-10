---
id: model-product-tree
type: model
kind: element-tree
statement: what does the shipped product consist of - the part-of hierarchy?
class: review
killer: false
---
```mermaid
flowchart TD
  product["quackitect - the shipped product"]
  engine["engine-go - the determinizer binary"]
  method["method - the process layer"]
  prompts["prompts - contract, engage, compose"]
  rigor["rigor - vibe, lean, systematic"]
  modelkinds["models - the kind registry"]
  types["project types and stakeholder classes"]
  roles["roles - the implementation seam"]
  brand["brand - voice and identity"]
  product -->|has| engine
  product -->|has| method
  product -->|has| brand
  method -->|has| prompts
  method -->|has| rigor
  method -->|has| modelkinds
  method -->|has| types
  method -->|has| roles
```
## Rationale (not load-bearing)
The third model (owner ruling 2026-07-10: "flow doesn't catch all"). Part-of only - composition of the shipped product/ tree; ranking stays in model-engine-layers, an orthogonal dimension. Conformance target: the product/ directory tree itself.
