---
id: req-base-view-queries
type: requirement
statement: The engine shall evaluate deterministic base view queries over node data, including map values. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Where a spec note embeds a base block, the engine shall evaluate it deterministically within the pinned subset - filter trees, comparisons, file predicates, order, sort, limit, groupBy with count - and shall refuse volatile functions and out-of-subset constructs with an error. *(was req-base-views)*
2. The parser shall accept a one-level map value in node frontmatter and expose its entries to views. *(was req-ratings-map)*
