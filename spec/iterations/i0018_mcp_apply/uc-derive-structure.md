---
id: uc-derive-structure
type: usecase
statement: An architect asks the engine to derive a model's structure from real coupling, and gets a proposed module grouping, a layer ordering, and the residual cycles to reconsider.
class: review
killer: false
---
## Rationale (not load-bearing)
The band and layer allocations are authored by hand today.
The architect wants a data-driven second opinion from the code's real coupling.
The proposal names where the computed structure agrees with the hand-authored bands and where it does not.
