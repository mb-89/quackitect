---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.stamp-who-answered-and-where
type: "[[function]]"
cluster: the-account
statement: record, with every call, which model answered it and which state the walk stood in
satisfies:
  - req-every-call-records-the-model-that-answered-it
  - req-every-call-records-the-state-it-was-made-in
inputs:
  - flow-dispatched-call
outputs:
  - flow-call-attribution
---

## Rationale

STAMPED WHERE THE CALL IS SERVED, which is where the acting role is already stamped and for the stated reason: the code that knows writes it, and nothing downstream infers it.

ONE OF THE TWO IS HONEST AND THE OTHER IS A CLAIM. The state is known to the server. The model is known only to the caller, so the function must carry the distinction rather than flatten it — a field that reads like an observation and is a claim is worse than an absent one.
