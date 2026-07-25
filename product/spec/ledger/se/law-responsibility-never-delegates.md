---
id: se.law-responsibility-never-delegates
kind: decision
statement: "HUMAN INVOLVEMENT IS A SLIDER; RESPONSIBILITY IS NOT. The owner may dial their involvement anywhere from adjudicating every killer to delegating an entire iteration and being absent for all of it - and the system must SUPPORT the far end of that slider rather than treat it as a degraded mode. But the responsibility for the output never moves with the slider. Owner ruling 2026-07-25: 'The human who runs this machine in the end is always responsible for the output. Even if he delegates a whole iteration to the machine. There is never gonna be shifting of responsibility away from the human. If I make the decision, that's still my thing to do, and I need to own it if it doesn't work.' TWO CONSEQUENCES THAT SHAPE DESIGN. (1) The answer to a quality problem is NEVER 'put the human back in the loop' - that trades away the goal. It is to make the machine's own checks strong enough that an agent-blessed killer is trustworthy: everything that can be judged mechanically MUST be judged mechanically, so that a delegated gate rests on computation rather than on the agent's honesty or attention. (2) Because the owner carries the responsibility either way, the record must let them AUDIT what they delegated - every self-blessed gate stamped agent with its delegating decision, every check that was computed distinguishable from every check that was asserted. Delegation without an audit trail would ask them to own something they cannot inspect."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Either the system drifts toward requiring a human at every killer - which kills unattended and parallel iterations, the whole point - or delegation quietly reads as the machine taking responsibility, which no machine can carry. Both failures start by treating the involvement slider and the responsibility as the same dial.
applies_to: adjudication policy, delegation grants, and every argument that a quality problem should be fixed by more human review
---


