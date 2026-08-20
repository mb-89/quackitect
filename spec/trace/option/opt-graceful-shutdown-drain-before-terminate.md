---
minted_in: i36
id: opt-graceful-shutdown-drain-before-terminate
type: "[[option]]"
statement: Give the process a bounded grace window to finish its current unit of work before an external stop takes effect, rather than either stopping instantly or blocking forever.
cluster: cluster-the-walk
found_by: analogy
source: "Container orchestration's graceful termination: a SIGTERM starts a grace period (Kubernetes terminationGracePeriodSeconds, default 30s) during which the workload may finish and exit cleanly before SIGKILL. Documented pattern, Kubernetes Pod lifecycle."
---

## Mechanism

Abstracted one level: keeping a running unit of work alive until it reaches
a safe stopping point, when something outside it wants it to end now.

Orchestration platforms solve this with a fixed grace window: the stop
signal arrives, the workload gets bounded time to reach a safe point, and
only then does termination become unconditional.

WHAT SURVIVES THE TRANSFER. The shape — a stop is a request with a grace
period, not an instant demand — matches what hold-the-session-through-work
already does structurally.

WHAT DOES NOT. The grace period there is a FIXED DURATION regardless of
what the workload is doing. This project's own condition is the opposite:
open-ended until the MACHINE reports a real stopping point (wait, a
blocker, or a completed target), never a clock. A duration-based grace
period would let a genuinely mid-write walk get killed on a timer, which is
exactly the failure this project's own requirement forbids.
