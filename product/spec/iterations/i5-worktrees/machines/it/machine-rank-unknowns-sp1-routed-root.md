---
id: it.machine-rank-unknowns-sp1-routed-root
kind: machine_state
statement: "Spike 1 (25 min): loop, gate and apply operate against a NON-TRUNK root - TW1's deciding evidence."
machine: it.machine-rank-unknowns
state: sp1_routed_root
state_kind: work
filled_by: agent
---

## Guidance
Fixture repo with a real worktree: instantiate Loop/Gate/apply with root = the WORKTREE, walk an instance to a gate and bless it, execute an apply against the worktree's ledger. Pass = all laws (CAS, evidence pinning, grants) hold under the foreign root. Fail = record what broke; TW1 fires and K2 takes the build.

## Evidence form
- run_ref | the spike's run | required
- verdict | held or broke, one breath | required
