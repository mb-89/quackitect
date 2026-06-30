---
id: adr-white-label-argv
type: adr
statement: Derive the brand from argv[0] (invoked binary name) rather than a config field, and have `start init` name the launcher + binary after the project. Keep the hidden .quack/ dir as plumbing (like .git/) rather than renaming it per-project, which would force findRoot off its literal marker.
addresses: [req-white-label]
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
Zero-config white-label; the engine never hardcodes its own name. User decided to keep .quack/.
