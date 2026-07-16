---
id: test-onboarding-surface
type: test
statement: The rendered book carries section 2.2 with the newcomer arc, its deck link, and its filtered guides link. The guides table carries the deck row. The README carries the deck reference. This holds against a fixture and the live book.
class: executed
verify: selftest:onboarding-surface
killer: false
---
## Rationale (not load-bearing)
One test for the whole onboarding surface: chapter, triangle rows, links. Clustered because
every assertion reads the same rendered book - cheap to rerun whole, invalidated together.
