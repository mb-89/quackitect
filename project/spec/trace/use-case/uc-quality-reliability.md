---
id: uc-quality-reliability
type: "[[use-case]]"
statement: Rely on the walk to survive a break
actor: stk-engineer-driving-agents
kind: quality-area
trigger: Something fails mid-walk — a crash, a lost connection, a host that dies.
precondition: A walk is in flight and its position is committed to the repository.
guarantee: The walk resumes from where it stood, and a break that cannot be resumed says so instead of pretending.
refines:
  - sty-what-a-quality-is
priority: must
---

## What this characteristic covers

RELIABILITY, from ISO/IEC 25010:2023. The degree to which a system performs
its functions under specified conditions for a specified period of time.

Its sub-characteristics, so nobody has to open the standard to use this:

- FAULTLESSNESS. It performs without fault under normal operation. This
  replaced `maturity` in the 2023 revision.
- AVAILABILITY. It is operational and accessible when it is needed.
- FAULT TOLERANCE. It keeps operating despite hardware or software faults.
- RECOVERABILITY. After an interruption or failure it can recover the data
  directly affected and re-establish the desired state.

## Main scenario

1. The walk breaks mid-flight, without warning and without a person present.
2. The position is not held in memory alone — the repository already carries it.
3. The person or the agent returns and asks the machine where the walk stands.
4. The machine recomputes the position from the record and serves the same step.
5. The work resumes from there, with nothing rebuilt and nothing re-earned.

## Extensions

- 2a. The break happened mid-write: the write was atomic or it did not happen, so the record is never half-updated.
- 4a. Something under the walk moved while it was down: the machine says which claim stopped standing, rather than resuming onto ground that is gone.
- 5a. The break cannot be resumed at all: the machine says so and names why, because a walk that silently restarts is worse than one that admits it lost its place.
