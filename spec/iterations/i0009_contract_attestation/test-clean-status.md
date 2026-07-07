---
id: test-clean-status
type: test
statement: Every non-mutating command leaves git status clean; bless and baseline change only their spec/ truth files.
class: executed
verify: selftest:clean-status
killer: false
---
