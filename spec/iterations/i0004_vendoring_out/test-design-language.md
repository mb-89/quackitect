---
id: test-design-language
type: test
statement: Brand assets resolve through the overlay chain — the engine default (generic voice + a logo placeholder) is present and resolvable, a vehicle override wins, and the report embeds the resolved logo left of the project name.
verifies: [req-design-language]
class: executed
verify: selftest:brand-resolves
killer: false
---
## Rationale (not load-bearing)
Guards the overlay resolution of brand assets + the placeholder convention. New self-test (built next).
