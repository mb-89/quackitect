---
id: test-dep-prompt
type: test
statement: The dependency-check prompt exists and lists each build dependency with a winget path. A missing-tool path surfaces the prompt to the user.
verifies: [req-dep-prompt]
class: executed
verify: selftest:deps-prompt
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Passes once the dependencies prompt is authored during build.
