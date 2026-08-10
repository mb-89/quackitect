---
id: req-every-call-logged
type: "[[requirement]]"
statement: The engine shall append exactly one log line per dispatched call, carrying the call's outcome.
kind: quality
fitness_candidate: true
verify_method: test
verified_by:
  - "tests/boot.test.ts :: the gate is logged like everything else — a refused pre-boot call lands in the log"
breaks_if_removed: The audit has holes, and the person answers for acts the record never saw.
breaks_how_badly: fatal
refines:
  - uc-quality-maintainability
  - uc-take-a-step
source_refs:
  - uc-quality-maintainability step 2
  - uc-quality-maintainability ext 2a
  - ".se/req-mine-v2.md: logging, observability and the retro (v2-067, v2-069)"
  - ".se/req-mine-v1.md: the lane — mediated I/O"
  - stk-engineer-driving-agents
  - uc-take-a-step step 3
  - ".se/req-mine-v2.md: logging, observability and the retro"
priority: must
---

## Detail

The record carries the acting driver.

## Scenario

- source: any caller on the lane
- stimulus: a call is dispatched
- artifact: the call log
- environment: all operation, failures included
- response: one raw line lands with the call's outcome, and a refusal's line carries its clause
- response measure: log lines per dispatch = 1 exactly; dispatches without a line = 0
