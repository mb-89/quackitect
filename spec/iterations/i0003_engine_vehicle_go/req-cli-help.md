---
id: req-cli-help
type: requirement
refines: [uc-run-dep-free]
statement: Every subcommand reacts to -h and --help and -? by printing its usage and exiting with no side effects. The CLI rejects a version id that starts with a dash.
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2. From a field finding. quack start --help activated a stray version named --help. A shared argument preamble fixes it for all subcommands.
