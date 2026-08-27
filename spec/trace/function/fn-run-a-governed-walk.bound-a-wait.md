---
minted_in: i62-background-work-reports-its-own-end-the-
id: fn-run-a-governed-walk.bound-a-wait
type: "[[function]]"
cluster: the-record-life
statement: give every wait an end it will reach on its own, and produce an outcome when it reaches it
satisfies:
  - req-every-wait-declares-a-bound-and-expiry-acts
inputs:
  - flow-work-under-way
outputs:
  - flow-wait-bound
  - flow-settled-entry
controls:
  - whether any measurement of comparable work exists to set the bound from
source_refs:
  - uc-bound-every-wait-and-act-on-expiry
  - vp-autonomy-range
---

## Rationale

WHY THIS IS NOT PART OF KEEPING THE ACCOUNT TRUE. That function answers what
happened to work that ended. This one answers what happens to work that does
not end at all, and the two failures are different: one is a record that lies,
the other is a wait with no floor.

THE HUNG CASE IS THIS FUNCTION'S, DELIBERATELY. Work that exists and is making
no progress is invisible to a question about existence. Naming the bound as the
thing that catches it is what stops the existence question being asked to do a
job it cannot do.

WHAT KEEPS IT SOLUTION-NEUTRAL. It does not say the bound is a duration in
milliseconds, that a clock is read, or that anything is cancelled. A design
that counts attempts rather than seconds satisfies this. So does one where the
outcome is a refusal rather than an ending.

"AN END IT WILL REACH ON ITS OWN" IS THE DEMAND. A wait that ends only because
somebody notices is not bounded; it is watched, and on an unattended machine
nobody is watching.

THE CONTROL IS WHERE THE HONESTY LIVES. A machine with no comparable
measurement cannot set a bound from evidence, and the design must say the bound
was defaulted rather than pretend it was measured.
