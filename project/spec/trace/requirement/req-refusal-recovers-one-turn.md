---
id: req-refusal-recovers-one-turn
type: "[[requirement]]"
statement: "When the engine refuses a call, the engine shall return a typed rejection whose remedy, executed unchanged, is accepted on the next call."
kind: quality
verify_method: test
breaks_if_removed: "Agents stall at every refusal and a person has to rescue each walk by hand."
refines:
  - uc-stay-recoverable
  - uc-take-a-step
source_refs:
  - uc-stay-recoverable step 2
  - uc-stay-recoverable ext 2a
  - ".se/req-mine-v2.md: errors and refusals (v2-062, v2-064, v2-066)"
  - ".se/req-mine-v1.md: refusals and honesty"
  - stk-agent
  - uc-take-a-step ext 3a
  - ".se/req-mine-v2.md: errors and refusals"
priority: must
---

## Detail

| part | carries |
| --- | --- |
| clause | the stable id of the rule that fired |
| expected | what the rule wanted |
| got | what arrived |
| remedy | the corrected call, ready to send unchanged |
| source | where the rule binds |

## Scenario

- source: the driving agent, on any lane call
- stimulus: the engine refuses the call
- artifact: the typed rejection
- environment: normal operation, any supported harness, recovery battery
- response: the rejection carries the clause, the expectation, what arrived, its source and an executable remedy
- response measure: the remedy, executed unchanged, is accepted on the next call; 1 turn to recovery for every refusal clause, 0 clauses exempt
