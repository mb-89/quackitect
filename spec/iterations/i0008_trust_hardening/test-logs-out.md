---
id: test-logs-out
type: test
verifies: [req-logs-out-of-repo]
statement: The engine resolves its log directory to the stable user-scoped location, honors the config.toml override, and writes no log under the workspace.
class: executed
verify: selftest:logs-dir
killer: false
---
