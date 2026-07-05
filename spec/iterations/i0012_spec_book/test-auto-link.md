---
id: test-auto-link
type: test
verifies: [req-auto-link]
statement: Prose mentioning a term by alias renders linked; an authored link stays untouched; a longer name wins over its substring; code blocks and headings stay untouched; two notes claiming one alias refuse with an error.
class: executed
verify: selftest:auto-link
killer: false
---
## Rationale (not load-bearing)
TODO
