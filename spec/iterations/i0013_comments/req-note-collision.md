---
id: req-note-collision
type: requirement
depends_on: []
statement: If two note captures mint the same filename, then quack note shall write both notes under distinct filenames.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Bit us live at the i13 retro: a same-second, same-prefix capture silently overwrote a note.
