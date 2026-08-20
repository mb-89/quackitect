---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.publish-the-driver-outward
type: "[[function]]"
cluster: the-sizing
statement: put the named driver where whoever is driving can read it, and take no further action on it
satisfies:
  - req-the-machine-names-a-driver-and-starts-nothing
  - req-a-machine-decision-repeats
inputs:
  - flow-driver-recommendation
outputs:
  - flow-instruction
---

## Rationale

IT ALSO CARRIES THE SECOND HALF OF REPEATABILITY: what was read. An answer that
repeats but cannot say what it was derived from is reproducible only by luck —
nobody can tell whether it repeated because the inputs held or because nothing
looked. Publishing the driver publishes the reading behind it.

THE FUNCTION IS THE FULL STOP. Publishing is where the machine's part ends, and the requirement beside it forbids the obvious next step.

SOMETHING IS ALREADY LISTENING, established 2026-08-20: the lane answers over HTTP before an agent is launched, and the agent that is launched pulls. What no receiver can do today is become a different model, which is a hole outside this function rather than inside it.
