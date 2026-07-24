---
id: it.machine-build-steps-c2-depends-gate
kind: machine_state
statement: "c2 the start gate (E2+E3): assertDependsMet against the grants ledger (SE-C-072), worktree-mode start opening the instance in its tree."
machine: it.machine-build-steps
state: c2_depends_gate
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. depends_on read from the plan, satisfied only by a gate_release grant (adr-shipped-is-release-grant); Loop.start provisions per plan worktree mode and opens the instance inside the tree; SE-C-031 scopes per root. Greens the depends test.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
