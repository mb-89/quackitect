---
id: test-cli-help
type: test
statement: Each subcommand invoked with -h or --help or -? prints usage and makes no state change. An id starting with a dash is rejected.
verifies: [req-cli-help]
class: executed
verify: selftest:help
killer: false
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the shared argument preamble lands and the help test writes HELP_OK.
