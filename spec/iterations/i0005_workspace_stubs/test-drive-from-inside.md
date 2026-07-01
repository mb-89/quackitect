---
id: test-drive-from-inside
type: test
statement: The roundtrip/machinery test is extended so that after creating a bare workspace it drives that workspace FROM INSIDE via the committed launcher stub (resolving the engine at runtime) — status, next, a bless, report — and all steps succeed. State resolves under the workspace.
verifies: [req-drive-from-inside]
class: review
verify: selftest:workspace
killer: true
---
## Rationale (not load-bearing)
The i5 killer end-to-end demonstration. Extends test-machinery-e2e / selftest:workspace rather than adding a parallel harness; the full inside-drive is demonstrated live at M7.
