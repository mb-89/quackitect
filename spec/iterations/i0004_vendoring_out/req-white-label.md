---
id: req-white-label
type: requirement
refines: [uc-ship-branded-engine]
statement: The engine is brand-agnostic in all user-facing output — the brand derives from the invoked binary name (argv[0]). `start init` names the launcher <project>.cmd and binary <project>.exe after the target, so a vehicle's command and output read as the project, never "quack". The hidden .quack/ dir stays as plumbing. Shipped this session.
depends_on: [req-vehicle-scaffold]
class: review
killer: false
---
## Rationale (not load-bearing)
Grandfathered. White-label via argv[0]; user chose to keep .quack/ like .git/.
