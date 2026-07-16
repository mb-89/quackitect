---
id: req-lint-classification
type: requirement
statement: The book content lints shall classify correctly: comment interiors skipped, view-rendered nodes counted as referenced. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When the prose-mark check classifies a unit, it shall skip the interior of HTML comments. *(was req-prose-marks-comments)*
2. When a node renders through a view's rows, the book orphan lint shall count that node as referenced. *(was req-orphan-render-refs)*
