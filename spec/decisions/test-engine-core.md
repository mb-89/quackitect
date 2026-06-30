---
id: test-engine-core
type: test
statement: The core engine realizes suspect/bless, the fill/adjudicate split, and version-aware walking.
verifies: [suspect-bless, fill-adjudicate, versioning]
class: executed
verify: selftest:engine
killer: false
---

## Rationale (not load-bearing)
Baseline executed test. Asserts the core engine: suspect/bless exists, the fill/adjudicate split (filled_by recorded separately), and version-aware walking.
