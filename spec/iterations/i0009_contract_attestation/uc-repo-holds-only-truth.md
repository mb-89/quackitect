---
id: uc-repo-holds-only-truth
type: usecase
refines: [need-qualities]
statement: A checkout contains only recorded truth (spec/) and product; every cache is regenerable in the user data directory, so deleting the data dir loses nothing adjudicated and a fresh clone renders the same board on any machine.
class: review
killer: false
---
## Rationale (not load-bearing)
The amnesia test. Sort criterion: recorded adjudication truth vs regenerable. Truth mutations (bless, baseline) writing into spec/ is CORRECT under this model — in-repo writes are exactly the truth mutations.
