---
id: req-engine-loc-untracked
type: requirement
refines: [uc-drive-from-inside]
statement: The engine's location is resolved at runtime and never appears in version control. The workspace's `.gitignore` excludes the local engine pointer/binary (`.quack/engine.local`, any vendored engine), so a clone on another machine carries no absolute path and no engine.
class: review
killer: false
---
## Rationale (not load-bearing)
The "no hard link in version control" constraint. The link exists on the machine, not in the repo.
