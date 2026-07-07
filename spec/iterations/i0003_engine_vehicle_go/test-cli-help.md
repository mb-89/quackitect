---
id: test-cli-help
type: test
statement: Each subcommand invoked with -h or --help or -? prints usage and makes no state change. An id starting with a dash is rejected.
class: executed
verify: selftest:help
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the shared argument preamble lands and the help test writes HELP_OK.
