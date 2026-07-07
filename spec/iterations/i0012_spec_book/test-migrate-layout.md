---
id: test-migrate-layout
type: test
statement: migrate-layout moves trace-resident manifests, stakeholders, use cases, and raid notes to their template homes; a second run moves nothing; an existing destination is kept and warned about.
class: executed
verify: selftest:migrate-layout
killer: false
---
## Rationale (not load-bearing)
Guards the converter's contract on a fixture workspace: the moves, the idempotence, and the refusal to overwrite.
