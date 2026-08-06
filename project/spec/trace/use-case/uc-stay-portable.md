---
id: uc-stay-portable
type: "[[use-case]]"
statement: Continue the walk on another host
actor: stk-engineer-driving-agents
trigger: The machine or the harness changes.
precondition: The walk's position is committed to the repository.
guarantee: The same walk continues under the new host with zero repair steps.
refines:
  - sty-portability
killer: false
---

## Main scenario

1. The person sets up a fresh machine through the published install entry alone.
2. The install verifies itself and reports ready.
3. The person opens the project under a supported harness of their choice.
4. The lane arms with the same rules the previous host enforced.
5. A pull serves the walk from the position the previous host left.

## Extensions

- 1a. Setup needs a step the entry never named: the fresh-machine bar fails; the missing step is the defect, not the machine.
- 4a. The new host cannot arm the cage: the project reports the host unsupported instead of serving unguarded.
- 5a. The new host mangles served results (the parallel-read cancellation class): the walk retreats to a serving mode the host survives, and the retreat is recorded with its lifting condition.
