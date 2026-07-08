---
id: req-comment-ux
type: requirement
depends_on: []
statement: While a comment is unsaved, the comment layer shall warn before the book copy closes, shall keep the comment and minimize controls in one place, and shall not shift the comment bar when a comment posts.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c2 c18: unsaved comments must not be lost silently; the controls must not jump.
