---
id: test-battery-tiers
type: test
statement: The build fast-path runs only the fast selftest tier; quack selftest runs the full battery; the fast tier contains the build-invariant cases (parity, golden root, parser).
class: executed
verify: selftest:battery-tiers
killer: false
---
