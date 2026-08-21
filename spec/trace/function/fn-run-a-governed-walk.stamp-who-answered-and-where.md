---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.stamp-who-answered-and-where
type: "[[function]]"
cluster: the-account
statement: record, with every call, which model answered it, which state the walk stood in, and which part its caller played
satisfies:
  - req-every-call-records-the-model-that-answered-it
  - req-every-call-records-the-state-it-was-made-in
  - req-every-call-records-the-part-its-caller-played
  - req-a-weaker-driver-than-named-owes-a-recorded-reason
inputs:
  - flow-dispatched-call
outputs:
  - flow-call-attribution
---

## Rationale

IT ALSO CARRIES THE REASON, OR ITS ABSENCE. Where the driver that walked is
weaker than the one named, the record takes the stated reason — and where none
was given it takes the mark that says so. That is the same act as stamping who
and where: the record grows a field the server knows about the call.

STAMPED WHERE THE CALL IS SERVED, which is where the acting role is already stamped and for the stated reason: the code that knows writes it, and nothing downstream infers it.

ONE OF THE THREE IS HONEST AND TWO ARE CLAIMS. The state is known to the server. The model and the part played are known only to the caller, so the function must carry the distinction rather than flatten it — a field that reads like an observation and is a claim is worse than an absent one.

THE THIRD COORDINATE IS THE PART, added 2026-08-20. A walk is driven by two hands: a WALKER doing the daily work and a GUIDE asked for the steps the walker will not take alone. Both are agents at the dispatcher and both are stamped `agent` today, so the log cannot say how much of a walk the strong hand did.

AND THE RELAY IS THE CASE THAT LOSES MOST. Either hand may work the lane. Where the walker carries a guide's work back instead of the guide filing it, there is no call of the guide's to mislabel — the judgment simply appears under the walker. The function takes the part from the work's AUTHOR, not from whoever made the call.

THE MODEL IS NOT A PROXY FOR THE PART. `guidance/method/subagents.md` § Which model says judgment work inherits the session model, so a guide can carry the walker's own model name.
