---
id: it.machine-build-steps-c2-milestone-lane
kind: machine_state
statement: "c2 the milestone lane: commitMilestone fixes an iteration's state onto its OWN branch, from any calling root."
machine: it.machine-build-steps
state: c2_milestone_lane
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/worktree.ts: commitMilestone(root, iteration, message) drives git with an explicit worktree target (the promoted P1 rule - never trust the caller's cwd, which is what makes a board-originated bless behave like an agent one). Returns committed:false when there is nothing to commit; never creates an empty commit; never touches trunk. Greens the two milestone checks. Carries F1; realizes se.adr-milestone-commits-on-branch.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
