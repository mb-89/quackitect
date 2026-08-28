---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: fn-govern-a-conversation-under-a-stated-rule.refuse-a-departure-that-states-no-reason
type: "[[function]]"
statement: refuse a departure that states no reason
satisfies:
  - req-an-exemption-without-a-reason-is-refused-at-write-time
inputs:
  - flow-a-departure-as-offered
outputs:
  - flow-the-refusal-of-a-departure
controls:
  - the departure carries no reason
cluster: cluster-the-door-regime
source_refs:
  - uc-declare-an-exception-to-a-rule
---

## Rationale

Recording and refusing are one demand with two outcomes, and they are split
because the refusal has to reach the author at write time.

A reason collected later is collected from somebody who no longer remembers.
A refusal handed back at the moment of writing is answered by the one person
who knows, while they still know.

The refusal is a boundary flow. Nothing inside the system consumes it — it
goes to whoever offered the departure.
