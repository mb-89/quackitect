---
id: it.machine-build-steps-c3-atomic-close
kind: machine_state
statement: "c3 the atomic close: shipMerge refuses on doubt, tags before merging, and commits a two-parent merge whose tree carries only live claims."
machine: it.machine-build-steps
state: c3_atomic_close
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/worktree.ts shipMerge, in order: count commits ahead of the fork point and refuse if zero; create the tag and refuse if it cannot be; merge --no-commit; abort and refuse on conflict; drop c1-classified paths from index and worktree; commit; mark suspects; retire the worktree. Every refusal leaves trunk's HEAD unchanged with no merge pending. Greens the empty-branch, untaggable, conflict and filtered-close checks. Carries F2, F3, F5, F6, F7, F9; realizes se.adr-close-merge-filter and se.adr-tag-before-merge. Depends on c1.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
