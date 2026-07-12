---
id: req-field-schemas
type: requirement
depends_on: []
statement: The engine shall check node field values against per-field schemas declared in the method layer - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The method layer shall declare a per-field schema for node and item fields, carrying the field's type, its enum values where the field is enumerated, its default where one exists, and its tier of core or deferrable.
2. When quack lint runs, the engine shall report every node field value that violates its field schema, naming the node, the field, and the broken rule.
3. When the schema tester runs, the engine shall check the schema set itself, refusing a schema whose type is unknown, whose default falls outside its own enum, or whose tier is missing.
