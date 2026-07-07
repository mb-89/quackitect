---
id: req-comment-escape
type: requirement
depends_on: []
statement: The comment layer shall render stored comment text as text, never as markup.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [security]
---
## Rationale (not load-bearing)
A pasted script in a comment must stay inert when the owner reopens the copy.
