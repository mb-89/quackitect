---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.account-for-the-arrival
type: "[[function]]"
cluster: the-arrival
statement: "report what each step did, and which one failed, without ending the session"
satisfies:
  - req-the-arrival-never-costs-the-session
inputs:
  - flow-arrival-account
  - flow-runtime-verdict
outputs:
  - flow-arrival-account
---

## Rationale

Nobody is watching, so what is printed is the whole account. The requirement it satisfies is the two-sided guarantee: an arrival that failed must not look like one that succeeded.

AND IT NEVER ENDS THE SESSION. A hook that can take down a session start is worse than the hand-work it replaces, so every ending here is a line and exit 0.
