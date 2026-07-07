---
id: req-book-shell
type: requirement
statement: The book shall render an mdbook-style shell: a fixed sidebar carrying the table of contents, a global search, the compiled filter expression, and a details card, beside the single content column.
class: review
killer: false
phase: [operation]
discipline: [design, software]
quality: [usability]
---
## Rationale (not load-bearing)
Owner ruling 2026-07-07: the reading surface follows mdbook's shape - navigation,
search, and filtering live in one sidebar; the content column stays clean. Every
filter interaction compiles into ONE hand-editable expression, so the UI state is
inspectable and reproducible. The details card mirrors the report's right-panel
pattern. The report's visual language carries over.
