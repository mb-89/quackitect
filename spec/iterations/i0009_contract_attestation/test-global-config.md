---
id: test-global-config
type: test
verifies: [req-global-config]
statement: Machine-local overrides resolve from the global user config; a per-repo override file is ignored and reported.
class: executed
verify: selftest:global-config
killer: false
---
