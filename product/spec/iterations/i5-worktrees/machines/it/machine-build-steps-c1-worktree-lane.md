---
id: it.machine-build-steps-c1-worktree-lane
kind: machine_state
statement: "c1 the worktree lane (E1): provision/adopt, retire (ship removes, abandon flags), openWorktrees, the gitignore duty."
machine: it.machine-build-steps
state: c1_worktree_lane
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/worktree.ts per adr-worktree-home-inrepo: .worktrees/<iter> on iter/<iter> branches; adoption on leftovers; .abandoned flag file; the trunk .gitignore gains the .worktrees/ entry idempotently. Greens the provision/adopt and abandon/debris tests.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
