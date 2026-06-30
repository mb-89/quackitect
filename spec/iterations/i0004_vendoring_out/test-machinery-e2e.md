---
id: test-machinery-e2e
type: test
statement: A vehicle (from start init) creates a dummy workspace, and the engine drives that workspace through a FULL systematic iteration with empty content (a machinery test) — start, gather, compose, every milestone gate M1-M8, coverage rules, report, ship — and all gates pass. State resolves under the workspace, not the engine.
verifies: [req-workspace-split]
class: review
verify: selftest:workspace
killer: true
---
## Rationale (not load-bearing)
The i4 killer end-to-end demonstration (the user's acceptance bar). selftest:workspace exercises the machinery non-interactively where possible; the full bless walk is demonstrated live at M7. Empty trace -> coverage vacuously green; review gates blessed with machinery-test rationale.
