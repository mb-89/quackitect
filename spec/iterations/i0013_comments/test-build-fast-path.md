---
id: test-build-fast-path
type: test
statement: A second quack build with unchanged engine source skips the compile; a build after touching a .go file compiles.
class: executed
verify: selftest:build-fast-path
killer: false
---
## Rationale (not load-bearing)
TODO
