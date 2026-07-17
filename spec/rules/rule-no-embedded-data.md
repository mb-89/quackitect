---
id: rule-no-embedded-data
type: rule
scope: the engine binary and its build
statement: The engine binary carries no embedded data. Resources resolve from the live layer beside it, never from a frozen copy inside the executable. Owner ruling 2026-07-16.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
---
## Rationale (not load-bearing)
An embedded copy freezes at compile time. The layer it copied keeps moving, and the two drift apart silently. The live layer stays the single source: templates, method prompts, and schemas resolve from the vendored source and the workspace at run time. Violating this costs a stale-resource class of bugs that no test sees, because the binary carries its own truth.
