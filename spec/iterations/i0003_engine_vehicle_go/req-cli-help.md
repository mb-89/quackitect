---
id: req-cli-help
type: requirement
statement: Every subcommand reacts to -h and --help and -? by printing its usage and exiting with no side effects. The CLI rejects a version id that starts with a dash.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2. From a field finding. quack start --help activated a stray version named --help. A shared argument preamble fixes it for all subcommands.
