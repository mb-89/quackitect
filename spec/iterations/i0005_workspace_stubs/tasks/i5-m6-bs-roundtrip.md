---
id: i5-m6-bs-roundtrip
statement: Extend the roundtrip machinery test (`selftest:workspace`) so that after creating a bare workspace it drives it FROM INSIDE via the emitted launcher (resolving the engine at runtime) — status, next, a bless, report. Wires test-drive-from-inside (the killer demonstration).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-bs-selftest-stubs]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). The end-to-end proof, reusing the existing roundtrip harness per the user's ask.
