---
id: model-kind-element-tree
question: what is the system made of - the part-of hierarchy?
format: mermaid-flowchart
choose-when: part-of nesting is the meaning - physical devices, module breakdowns, work distribution
smells: sky-fall
---
# element-tree

A flowchart without subgraphs: parent -->|has| child edges over declared elements.
Part-of nesting ONLY - ranking belongs to the onion layer map, an orthogonal dimension.
The function tree and the element tree are DIFFERENT trees (SyA: functional vs
static partitioning); allocation maps between them.

## By example (the mint stub)
```mermaid
flowchart TD
  elem-system["the whole"]
  elem-part-a["first part"]
  elem-part-b["second part"]
  elem-system -->|has| elem-part-a
  elem-system -->|has| elem-part-b
```
