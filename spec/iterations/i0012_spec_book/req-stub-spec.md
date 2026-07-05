---
id: req-stub-spec
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: When start stubs seeds a bare workspace, the engine shall emit the spec template skeleton alongside the existing stubs.
class: review
killer: false
---
## Rationale (not load-bearing)
The instantiation path: a fresh project gets the nine chapter skeletons, the README, and the canned queries from the shipped template set. Caught in the final redteam pass - without this the template works only where hand-copied.
