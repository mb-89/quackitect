---
id: req-comment-close
type: requirement
depends_on: []
statement: When a reader closes a thread, the comment layer shall keep the thread in the island, hide its highlight from the page, and offer a reopen control.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability, reliability]
---
## Rationale (not load-bearing)
Resolve hides, never deletes (Word pattern). The sidebar's list view still shows closed threads.
