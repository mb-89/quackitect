---
id: test-actor-channels
type: test
verifies: [req-actor-channels]
statement: A non-interactive bless stamps actor=agent by default, --by human overrides it, the interactive-console path resolves human, and QUACK_ACTOR no longer influences the stamp.
class: executed
verify: selftest:actor-channels
killer: false
---
