---
id: test-render-drift
type: test
verifies: [req-render-drift]
statement: A hand-edited generated entry file, or a contract edit without re-render, makes quack lint flag drift; a fresh render clears it.
class: executed
verify: selftest:render-drift
killer: false
---
