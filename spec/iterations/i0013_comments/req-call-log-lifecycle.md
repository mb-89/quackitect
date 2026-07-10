---
id: req-call-log-lifecycle
type: requirement
statement: The engine shall retain a capped call log and surrender its aggregate at the retro - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When quack calls --summary runs, the engine shall print the call-log aggregate and delete the log. *(was req-calls-summary)*
2. If the call log exceeds its size cap, then the engine shall drop the oldest lines. *(was req-log-retention)*
