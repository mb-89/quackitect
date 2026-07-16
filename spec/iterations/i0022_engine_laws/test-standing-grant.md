---
id: test-standing-grant
type: test
statement: A recorded grant carries scope and expiry. An in-scope agent bless stamps the grant id. An uncovered agent bless on a killer is refused. An agent-channel grant open is refused. The close presents the collection.
class: executed
verify: selftest:standing-grant
killer: false
tests_red: exempt - red was observed at the pre-amendment hash; the statement-3 honesty amendment landed after the red and the behavior is already built, so the amended red is unobservable (adr-red-unobservable)
---
