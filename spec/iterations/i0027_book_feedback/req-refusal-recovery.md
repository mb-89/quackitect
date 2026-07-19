---
id: req-refusal-recovery
type: requirement
depends_on: []
statement: When the engine refuses a command or reports a cache miss, it shall name the cause and the one recovery command.
class: review
killer: false
kind: functional
provenance:
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Rationale (not load-bearing)
The i24-i27 field sessions lost time to refusals that named no way forward; a refusal carrying its recovery is cheaper than any documentation.
