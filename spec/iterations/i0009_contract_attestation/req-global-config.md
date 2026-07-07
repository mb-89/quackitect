---
id: req-global-config
type: requirement
statement: When resolving machine-local overrides, the engine shall read the single global config file in the user data directory.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
Per-repo .quack/config.toml overrides die with the folder; a global user config avoids the chicken-egg of an override stored in the directory it overrides.
