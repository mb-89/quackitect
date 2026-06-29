---
id: req-version-mgmt
type: requirement
refines: [uc-engage-next]
statement: quack next picks the latest not-done version, else the earliest planned. It announces its choice. It locks onto a named version. With a single active version, next behaves as today. It stays back-compatible. Deterministic ops create a planned version and append to an unstarted one. This replaces the hand-written iteration.md.
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2. Closes the engine-gap note.
