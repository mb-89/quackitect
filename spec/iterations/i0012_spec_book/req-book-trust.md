---
id: req-book-trust
type: requirement
statement: The book shall render its exact ledger truth: live state, stamped identity, drift flagged at ship. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The book shall render each node with its live ledger state - a SUSPECT or unverified node is visibly marked as such. *(was req-book-honesty)*
2. The book shall name the exact spec state it renders - the merkle root, the active iteration, and the engine version are stamped in the artifact. *(was req-book-identity)*
3. If the committed book differs from a fresh render at ship, then quack lint shall flag the drift. *(was req-book-drift)*
