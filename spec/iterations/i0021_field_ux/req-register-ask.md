---
id: req-register-ask
type: requirement
statement: When a red register row is worked, the engine shall raise a decision ask on the existing ask path and record the answer with its actor and channel. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a red row is opened, the register shall present its decision as an inline questionnaire with options.
2. When the questionnaire is answered, the engine shall record the decision with actor and channel and recolor the row from its new provenance.
3. The mobile questionnaire shall ride the same renderer as the register's inline one.

## Rationale (not load-bearing)
The register, the ask loop, and the questionnaires unify into one system (register seed). A red
row is a decision ask (kind decision, options) on the i15 ask/bless path - tap red, answer,
provenance recorded, green. Also carries the socratic-readiness provenance commitment
(NOTE-20260710-114852, soft fifth): the recorded answer IS the provenance field.
