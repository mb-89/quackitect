---
id: req-comment-dom-static
type: requirement
depends_on: []
statement: The comment layer shall leave the rendered book content unchanged outside its own island, root element, and highlight registrations.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [reliability, maintainability]
---
## Rationale (not load-bearing)
Protects the i12 book-dom-static rule and makes save idempotent: saving an uncommented copy is a byte-level no-op on the content.
