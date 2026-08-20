---
minted_in: i36
id: flow-stop-decision
type: "[[flow]]"
statement: whether the harness may end the session now
kind: signal
crosses: out
source_refs:
  - req-stop-hook-yields-only-at-a-machine-stop
---

## It crosses OUT, to the harness asking to stop

The decision answers the host's own stop request. The host is outside the
system boundary, so nothing inside consumes this flow.
