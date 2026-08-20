---
minted_in: i36
id: fn-run-a-governed-walk.hold-the-session-through-work
type: "[[function]]"
cluster: the-walk
statement: keep the agent session open while the machine still has executable unblocked work
satisfies:
  - req-stop-hook-yields-only-at-a-machine-stop
inputs:
  - flow-position
outputs:
  - flow-stop-decision
---

## Rationale

An unattended walk on a cloud machine has nobody to restart it. A session
that ends between states while work remains executable loses that work
silently, and nothing downstream can tell the difference between "finished"
and "stopped early".

THIS PREVENTS; IT DOES NOT DIAGNOSE. Reporting what ended a call that
already stopped is `name-the-stopping-layer`. This function only ever looks
at whether the current position still has unblocked work, never at why an
earlier call ended.
