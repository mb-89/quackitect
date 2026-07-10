---
id: req-book-artifact
type: requirement
statement: The book shall compile to one self-contained, accessible, machine-digestible HTML artifact with an mdbook-style shell - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall compile the spec into one self-contained HTML book that renders with no external requests. *(was req-book-single-file)*
2. The book shall render an mdbook-style shell: a fixed sidebar carrying the table of contents, a global search, the compiled filter expression, and a details card, beside the single content column. *(was req-book-shell)*
3. The book shall carry every content layer in the DOM as semantic HTML at render time - script filters and toggles visibility and never creates content. *(was req-book-dom-static)*
4. The book shall be operable by keyboard and readable by assistive technology - semantic structure, focus order, and contrast follow WCAG 2 level AA where applicable. *(was req-book-a11y)*
5. Where a manifest unit references a figure, the book shall embed it inline in a text-based form that a language model reads - no external asset request. *(was req-book-figures)*
6. The book shall be digestible by a language model without a companion artifact - text extraction preserves the layer labels, the normative statements, and the trust metadata; a separate index is emitted only where extraction alone proves insufficient. *(was req-llm-digestible)*
