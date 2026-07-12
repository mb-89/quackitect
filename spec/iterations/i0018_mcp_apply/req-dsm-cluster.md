---
id: req-dsm-cluster
type: requirement
depends_on: []
statement: When an architect requests a model's structure, the engine shall cluster its design regions by coupling and order the clusters into layers, reporting the residual cyclic couplings - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When an architect requests a model's structure, the engine shall cluster its design regions by coupling and order the clusters into layers, reporting the residual cyclic couplings.
2. The engine shall compute the clustering deterministically, so a given coupling graph always yields the same clusters, layers, and tears.
