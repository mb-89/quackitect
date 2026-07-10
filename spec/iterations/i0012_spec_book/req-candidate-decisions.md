---
id: req-candidate-decisions
type: requirement
statement: The spec shall model decisions choosing among rated candidates, rendered deterministically in their owning chapters - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall carry candidate nodes - an axis, ratings from zero to one per criterion - that decisions choose or reject through links, and the book shall render the candidates against the criteria as a derived matrix. *(was req-candidates)*
2. The candidate verdict shall not depend on map iteration order, and quack lint shall flag a candidate claimed by more than one decision. *(was req-verdict-order)*
3. The engine shall carry one decision node type with a kind of architecture, project, or waiver, and the book shall render each kind in its owning chapter view. *(was req-decision-kinds)*
