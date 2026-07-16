---
id: req-root-content
type: requirement
statement: The identity root shall hash pooled queries and reference notes.
---
## Statements
1. The identity root shall hash every pooled query file under spec/queries.
2. The identity root shall hash every reference note under spec/references.
3. If a hashed query or reference changes, then dependent checks shall go suspect.

Closes the i12 trust gap: an edited base file changed every book table silently.
