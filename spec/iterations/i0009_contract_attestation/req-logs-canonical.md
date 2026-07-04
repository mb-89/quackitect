---
id: req-logs-canonical
type: requirement
refines: [uc-stable-data-dir]
statement: When resolving the workspace data directory, the engine shall canonicalize the workspace path — casing, separators, symlinks — before hashing and slugging.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
One-time merge of the already-split log homes (quackitect-c5212d / quackitect-9cb46b) rides the build as a migration step, same pattern as the i8 log move.
