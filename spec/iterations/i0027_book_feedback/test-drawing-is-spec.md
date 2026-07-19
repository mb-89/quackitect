---
id: test-drawing-is-spec
type: test
statement: A committed Excalidraw drawing in an iteration folder loads without becoming a node or a strict issue.
class: executed
verify: selftest:parser-strict
killer: false
tests_red: exempt - built as an unblocking bugfix; the drawing assertion lives in the parser-strict recognition selftest and was green on landing (adr-red-unobservable)
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: shares the recognition-rule selftest (nodeFence)
---
## Rationale (not load-bearing)
The graph refused to load because a committed drawing opened with the `---` fence and was parsed as a trace node. The recognition rule now rejects an `excalidraw-plugin` frontmatter, so the drawing is ignored unless a requirement links it. The assertion rides the structural-strictness selftest, which owns the recognition rule.
