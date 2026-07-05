---
id: req-engine-loc-untracked
type: requirement
refines: [uc-drive-from-inside]
statement: The engine's location shall be resolved at runtime and shall never appear in version control - a clone on another machine carries no absolute engine path and no engine binary.
class: review
killer: false
---
## Rationale (not load-bearing)
The "no hard link in version control" constraint. The link exists on the machine, not in the repo. Restated at i11: with the pointer file retired (adr-retire-legacy-lanes), the stubs commit no machine-local state at all - the `.gitignore` stub died with it.
