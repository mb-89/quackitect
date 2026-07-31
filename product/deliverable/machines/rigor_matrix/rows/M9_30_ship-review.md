---
kind: matrix-row
name: ship-review
statement: "The ship review: dependency flips, divergence flags, upstream proposals."
state_kind: work
filled_by: agent
depends_on:
  - package
evidence:
  - name: review
    description: "the dependency list with rulings; new asks answered"
  - name: upstream
    description: "proposals deposited, or none owed"
---

## Guidance

Per [[meth-dependency-ship-review]]: display everything, ask only where no sticky ruling exists or the state changed; diverged deps ship flagged; upstream offers deposited, never pushed.
