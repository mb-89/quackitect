---
id: test-binary-deps
type: test
statement: A built engine binary exists and is self-contained. It runs from an unzipped folder with no Python, no uv, and no web download.
verifies: [req-go-engine]
class: executed
verify: selftest:deps
killer: false
---

## Rationale (not load-bearing)
M6 executed. Placeholder that stays OPEN until the Go binary is built and vendored under .quack/engine. EXTEND during build to assert no dynamic non-system deps and no network calls.
