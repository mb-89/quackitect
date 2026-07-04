---
id: req-mint
type: requirement
refines: [uc-deterministic-minting]
statement: When quack mint runs for a node type, the engine shall emit a schema-valid skeleton with engine-stamped id, timestamp, and typed frontmatter.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Veto/defer/supersede minting especially becomes an op (correct sink edge, ready_when field, supersedes edge) so derived classification can never be misspelled.
