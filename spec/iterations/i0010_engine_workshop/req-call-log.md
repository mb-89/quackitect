---
id: req-call-log
type: requirement
refines: [uc-call-observability]
depends_on: []
statement: When a command dispatches, the engine shall append one JSONL line to the workspace logs carrying timestamp, command, arguments with secret values redacted, duration, exit code, and channel.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
