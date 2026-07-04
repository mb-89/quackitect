---
id: test-root-marker
type: test
verifies: [req-root-marker]
statement: The walk-up resolves the nearest directory containing spec/project.toml as root; without one the engine refuses with a clear error.
class: executed
verify: selftest:root-marker
killer: false
---
