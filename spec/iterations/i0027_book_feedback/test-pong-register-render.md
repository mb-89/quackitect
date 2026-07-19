---
id: test-pong-register-render
type: test
statement: The pong deck's register slide renders the sample register through the real component, and the deck source carries no authored HTML table.
class: executed
verify: selftest:pong-register-render
killer: false
tests_red: exempt - the fig kind, the slide edit, and the test landed in one authoring pass, so no red was observable (adr-red-unobservable)
provenance:
  statement: agent-authored at c15 per the owner's statement-and-evidence split ruling
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
A render is not slide text, so the arc scan has nothing to flag by construction. The singularity rule applies: the old table's absence is asserted, not assumed.
