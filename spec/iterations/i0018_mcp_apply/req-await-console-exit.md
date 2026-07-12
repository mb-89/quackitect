---
id: req-await-console-exit
type: requirement
depends_on: []
statement: While an await runs, the engine shall end the await when the workspace call log records an engine call from another process, handing the walk back to drain mode.
class: review
killer: false
---
## Rationale (not load-bearing)
The owner escalation-ladder ruling NOTE-20260710-192031: every quack call already logs to calls.jsonl, so the await loop can watch for foreign console activity and exit. The prompt rule "stop await when the user types" then enforces itself; the method keeps only the judgment of when to start one.
