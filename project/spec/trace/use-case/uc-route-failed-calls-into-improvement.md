---
minted_in: i36
id: uc-route-failed-calls-into-improvement
type: "[[use-case]]"
statement: Recover from a failed tool call and route repeated product-relevant failure shapes into durable work.
actor: stk-agent
trigger: a lane call refuses, errors or is cancelled
precondition: the lane records the call and its outcome
guarantee: the immediate work receives a remedy, and repeated non-misuse failures receive a durable disposition
refines:
  - sty-turn-a-failed-call-into-improvement-work
priority: must
---

## Main scenario

1. A lane call does not return a successful result.
2. The lane classifies the failure shape from recorded evidence.
3. The agent follows the immediate remedy without leaving the current state.
4. The lane counts the same shape across the active iteration window.
5. A repeated product-relevant shape becomes iteration evidence or a RAID entry.
6. The iteration fixes the shape or carries it with an owner and trigger.
7. Close evidence names the failure shape and its disposition.

## Extensions

- 2a. Clear agent misuse: count the call without creating product work by itself.
- 2b. Unclear schema or remedy: target the tool contract for improvement.
- 2c. Host-caused failure: target the harness profile and adapter.
- 2d. Engine-caused failure: target the owning engine path.
- 3a. Repeated remedy failure: treat the loop as an engine issue instead of successful recovery.
- 4a. One fatal occurrence: route it immediately instead of waiting for repetition.
