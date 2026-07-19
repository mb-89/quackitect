---
id: crit-self-contained
type: criterion
weight: 0.15
metric: external requests at open, and book size delta (MB)
target: zero external requests; size growth bounded by the embed budget discipline
statement: The axis weighs whether the book stays one dependency-free file of bounded size.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
---
## Rationale (not load-bearing)
Weight 0.15 - the book's one-portable-file guarantee is a standing quality; a candidate that breaks it is out regardless of score.
