---
id: test-integrate
type: test
statement: The engine resolves its rigor/type resources through the overlay chain (not a hardcoded path), and the integrate prompt with a worked example exists.
verifies: [req-integrate]
class: executed
verify: selftest:integrate
killer: false
---

## Rationale (not load-bearing)
M6 executed. Asserts the resource resolution is overlay-driven (so a vendored vehicle works) and that method/prompts/integrate.md is present. Demonstrated end-to-end by scaffolding a throwaway vehicle and running quack gather against it.
