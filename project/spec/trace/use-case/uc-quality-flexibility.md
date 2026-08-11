---
id: uc-quality-flexibility
type: "[[use-case]]"
statement: Move the walk to another machine, host or product
actor: stk-engineer-driving-agents
kind: quality-area
trigger: The machine changes, the harness changes, or the method is taken into somebody else's product.
precondition: The walk's position is committed to the repository.
guarantee: The same walk continues under the new arrangement with zero repair steps.
refines:
  - sty-what-a-quality-is
priority: must
---

## What this characteristic covers

FLEXIBILITY, from ISO/IEC 25010:2023. The degree to which a system can be
adapted to changes in its requirements, contexts of use, or system
environment. It replaced `portability` in the 2023 revision, and it is wider
than the name it replaced.

Its sub-characteristics, so nobody has to open the standard to use this:

- ADAPTABILITY. It can be adapted to different or evolving hardware, software
  or other environments.
- SCALABILITY. It can handle growing or shrinking workloads, or its capacity
  can be adjusted to it. Added in the 2023 revision.
- INSTALLABILITY. It can be installed and uninstalled successfully in a given
  environment.
- REPLACEABILITY. It can replace another product for the same purpose in the
  same environment.

## Main scenario

1. The person sets up a fresh machine through the published install entry alone.
2. The install verifies itself and reports ready.
3. The person opens the project under a supported harness of their choice.
4. The lane arms with the same rules the previous host enforced.
5. A pull serves the walk from the position the previous host left.
6. A second product vendors the method, overlays its own, and takes an upstream version without losing the overlay.

## Extensions

- 1a. Setup needs a step the entry never named: the fresh-machine bar fails; the missing step is the defect, not the machine.
- 4a. The new host cannot arm the cage: the project reports the host unsupported instead of serving unguarded.
- 5a. The new host mangles served results (the parallel-read cancellation class): the walk retreats to a serving mode the host survives, and the retreat is recorded with its lifting condition.
- 6a. The overlay and the upstream both changed the same thing: the conflict is reported and ruled, never resolved by silently preferring one.
