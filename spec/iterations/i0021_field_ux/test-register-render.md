---
id: test-register-render
type: test
statement: A gate's hand-off page renders its cone as color-coded rows - statement plus color collapsed, core fields on first expand, all fields with provenance on second, distinct marks for the two greens, y/n actions for a non-killer flow and the pager-law variant for killers; the report carries no register section.
class: executed
verify: selftest:register-render
killer: false
tests_red: exempt - the red was observed at 1d9bbe19 for exactly this behavior; an EARS wording fix on the verified requirement moved the hash after green, leaving no red observable at the current hash (adr-red-unobservable)
---
