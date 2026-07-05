---
id: req-residue-lint
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: If an unfilled slot placeholder remains in spec content, then quack lint shall flag it as a violation.
class: review
killer: false
---
## Rationale (not load-bearing)
A double-braced slot placeholder marks where prose goes; a leftover slot means an undrafted unit shipped. Fill comments are NOT residue - they are permanent authoring guidance, stripped at emit (owner ruling 2026-07-05). The lint targets slots only.
