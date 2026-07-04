---
id: test-render-drift
type: test
verifies: [req-render-drift]
statement: Every harness pointer file (CLAUDE.md, .github/copilot-instructions.md) exists and names AGENTS.md; a severed link turns the selftest red.
class: executed
verify: selftest:render-drift
killer: false
---
