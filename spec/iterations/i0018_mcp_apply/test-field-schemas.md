---
id: test-field-schemas
type: test
statement: Field schemas load from the method layer; lint reports a node value breaking its schema by node, field, and rule; the schema tester refuses a schema with an unknown type, an out-of-enum default, or a missing tier.
class: executed
verify: selftest:field-schemas
killer: false
---
## Rationale (not load-bearing)
Arrives RED at M6; the selftest does not exist at compose time.
