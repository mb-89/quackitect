---
id: req-fig-tables
type: requirement
refines: [uc-book-read]
depends_on: []
supersedes: []
statement: The book shall render the verification matrix and the stakeholder matrix from canned base queries in place of the retired figure kinds.
class: review
killer: false
---
## Rationale (not load-bearing)
Tables are tables, figures are figures: fig: keeps only spatial graphics whose selection is topological (context star, block tree, timeline). The tabular fig kinds migrate to shipped .base queries and gain live Obsidian preview. Amends adr-figures-derived-set: the derived set narrows to spatial figures.
