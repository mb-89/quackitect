---
id: test-global-binary
type: test
verifies: [req-global-binary]
statement: The launcher path resolves the global binary; with it absent, the build-from-vendored-source path is taken before the command runs.
class: executed
verify: selftest:global-binary
killer: false
---
