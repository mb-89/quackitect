---
id: test-ears-lint
type: test
verifies: [req-ears-lint]
statement: A new non-EARS or weasel-worded requirement is flagged with nonzero exit; an ears-exempt node carrying a reason is counted, not flagged; a pre-existing blessed statement is never flagged.
class: executed
verify: selftest:ears-lint
killer: false
---
