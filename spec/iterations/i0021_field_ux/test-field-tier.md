---
id: test-field-tier
type: test
statement: A fixture schema declares core and deferrable tiers; a node with an unadjudicated core field counts undecided; a node whose only defaults sit in deferrable fields counts complete-with-deferrals.
class: executed
verify: selftest:field-tier
killer: false
---
