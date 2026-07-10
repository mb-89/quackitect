---
id: req-multi-ask
type: requirement
depends_on: []
statement: While several asks are pending, the engine shall keep each ask independently answerable by its correlation id.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Blocked-waiting must not serialize (prior art law).
