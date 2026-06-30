---
id: test-claude-vendor
type: test
statement: start init vendors .claude/commands/* with the method path rewritten from product/quackitect/ to .quack/vendor/quackitect/, and the rewritten targets exist in the vehicle.
verifies: [req-claude-vendor]
class: executed
verify: selftest:claude-vendor
killer: false
---
## Rationale (not load-bearing)
New self-test over the rewrite.
