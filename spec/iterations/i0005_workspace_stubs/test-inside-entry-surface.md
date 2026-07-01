---
id: test-inside-entry-surface
type: test
statement: A bare workspace produced by the stub set contains a committed `AGENTS.md` that names `.\quack` as the drive command and references `quack resolve` / `quack guides` for path-free prompt loading, with no hard path to a quackitect checkout.
verifies: [req-inside-entry-surface]
class: executed
verify: selftest:stubs
killer: false
---
## Rationale (not load-bearing)
selftest:stubs asserts the entry-surface file exists and is self-contained.
