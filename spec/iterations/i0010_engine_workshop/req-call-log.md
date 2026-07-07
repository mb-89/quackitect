---
id: req-call-log
type: requirement
depends_on: []
statement: When a command dispatches, the engine shall append one JSONL line to the workspace logs carrying timestamp, command, arguments with secret values redacted, duration, exit code, and channel.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [maintainability]
---
## Rationale (not load-bearing)
TODO
