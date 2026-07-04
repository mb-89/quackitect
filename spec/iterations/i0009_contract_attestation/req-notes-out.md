---
id: req-notes-out
type: requirement
refines: [uc-notes-private]
statement: When a note is captured, the engine shall write it beneath the workspace's notes home in the user data directory, outside the repository.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Generalizes the i8 logsDir resolution into a data-dir resolution; surfaced via quack version. Migration of the 30+ existing notes rides the build, same verified-move pattern as the i8 log migration.
