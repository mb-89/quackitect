---
id: model-kind-structural
question: what is it made of - the part-of structure at one altitude?
format: mermaid-flowchart
choose-when: part-of nesting is the meaning - a whole product, an assembly, a module breakdown, work distribution
smells: sky-fall
---
# structural

A GENERIC part-of structure: parent -->|has| child edges over declared elements.
One model per altitude. A shipped product, a physical assembly, and a software
breakdown are each their own instance. Nothing product-specific lives in the kind.
Part-of nesting ONLY. Ranking belongs to the onion kind, an orthogonal dimension.
Other relations may ride labeled edges beside `has`.

```mermaid
flowchart TD
  el-whole["the whole"]
  el-part-a["part a"]
  el-part-b["part b"]
  el-sub["a sub-part"]
  el-whole -->|has| el-part-a
  el-whole -->|has| el-part-b
  el-part-a -->|has| el-sub
```
