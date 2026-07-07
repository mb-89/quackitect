---
id: req-comment-readback
type: requirement
depends_on: []
statement: When quack note --file2list runs on a commented copy, the engine shall print every comment as a note candidate with anchor, quote, thread, marks, and status, byte-identical across two runs.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [functionality, reliability]
---
## Rationale (not load-bearing)
The determinizer half of the loop; the agent consumes this listing, never the DOM.
