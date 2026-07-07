---
id: test-responsiveness
type: test
statement: On the reference machine, each interactive command gives feedback within 1 second (an acknowledgement if the work runs longer), and long tasks report progress at least once per minute.
class: executed
verify: selftest:perf
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the perf harness times the built binary on the reference machine and writes PERF_OK. A latency assertion is timing-sensitive, so the harness measures and records rather than asserting inline here.
