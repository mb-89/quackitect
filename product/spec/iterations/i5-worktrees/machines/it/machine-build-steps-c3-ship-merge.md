---
id: it.machine-build-steps-c3-ship-merge
kind: machine_state
statement: "c3 the ship merge (E4+E5): merge to trunk, fork-point overlap -> suspect frontmatter, conflict stops, tree retires."
machine: it.machine-build-steps
state: c3_ship_merge
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. shipMerge per adr-suspect-frontmatter: merge-base overlap of ledger paths, suspect field written on the merged trunk nodes, textual conflict aborts and records, ship retire removes the tree and keeps the branch. Greens the W1 killer and the conflict test.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
