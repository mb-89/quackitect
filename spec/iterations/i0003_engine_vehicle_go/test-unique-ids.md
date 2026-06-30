---
id: test-unique-ids
type: test
statement: No node id is declared in more than one file across the whole spec. The duplicate-id check is clean.
verifies: [req-unique-ids]
class: executed
verify: selftest:ids
killer: false
---

## Rationale (not load-bearing)
M6 executed. Passes now (the i3- prefix removed the collision). Stays green as a structural gate against future id clashes.
