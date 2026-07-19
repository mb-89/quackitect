---
id: test-context-model-interfaces
type: test
statement: Every boundary line of the context model carries its interface label, and a click opens the full interface note.
class: executed
verify: selftest:context-model-interfaces
killer: false
provenance:
  statement: agent-authored at c18 per the c16 card-4 ruling
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: a link anywhere in the book passes a bare contains, so the assertion scopes to the context model's own svg and pins one concrete boundary (the agent lane) by note id and label text.
