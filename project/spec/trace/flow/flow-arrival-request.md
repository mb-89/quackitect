---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: flow-arrival-request
type: "[[flow]]"
statement: "a session starting on a clone that has no lane"
kind: signal
crosses: in
source_refs:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
---

## It crosses IN, and nothing here produces it

THE HOST STARTS THE SESSION. Three arrival functions consume this and none
makes it, because it is not ours to make — a person opens a session, or a cloud
service does, and the arrival is what happens next.

WITHOUT THE FIELD the closure check read it as a missing function: something
consumed that nothing produces. It was minted at i35 without `crosses`, and the
first iteration to walk derive-functions afterwards is what found it (i17,
2026-08-18).
