---
id: uc-deterministic-minting
type: usecase
statement: Every note and trace node is born engine-stamped with schema-valid frontmatter; the agent fills content, never authors shape — no invalid node ever exists.
class: review
killer: false
---
## Rationale (not load-bearing)
The strict parser (i8) refuses malformed graphs at READ time; minting moves the guarantee to BIRTH time. The hand-written notes of 2026-07-03/04 are the format drift this removes. Sebot precedent: determinizer-stamped atoms from templates.
