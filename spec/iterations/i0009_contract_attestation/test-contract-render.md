---
id: test-contract-render
type: test
verifies: [req-contract-render]
statement: Rendering emits AGENTS.md and .github/copilot-instructions.md containing the full contract body verbatim; two renders of the same source are byte-identical.
class: executed
verify: selftest:contract-render
killer: false
---
