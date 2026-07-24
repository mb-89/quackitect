---
id: it.machine-rank-unknowns-sp2-fence-roots
kind: machine_state
statement: "Spike 2 (10 min): the fence denies direct tools under an ADDED worktree root - S4's hole probed."
machine: it.machine-rank-unknowns
state: sp2_fence_roots
state_kind: work
filled_by: agent
---

## Guidance
Extend a fixture lock with an extra root and run the fence check against a path under it. Pass = denied like any locked root (S4 closes by adding roots at start). Fail = the fence needs more than a lock entry; record what.

## Evidence form
- run_ref | the spike's run | required
- verdict | held or broke, one breath | required
