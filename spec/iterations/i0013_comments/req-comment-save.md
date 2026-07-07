---
id: req-comment-save
type: requirement
depends_on: []
statement: When a reader saves in a browser that grants file access, the comment layer shall write the commented copy back to its own file.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability, reliability]
---
## Rationale (not load-bearing)
File System Access API (Chromium). The TiddlyWiki pattern: a single file that saves itself.
