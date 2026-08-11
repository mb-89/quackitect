---
id: uc-quality-safety
type: "[[use-case]]"
statement: Stop short of the irreversible act
actor: stk-engineer-driving-agents
kind: quality-area
trigger: An agent is about to do something that cannot be undone.
precondition: An agent is walking with the autonomy slider above zero.
guarantee: The irreversible act is refused or handed to the person, and nothing already landed is destroyed to make room for it.
refines:
  - sty-what-a-quality-is
priority: should
---

## What this characteristic covers

SAFETY, from ISO/IEC 25010:2023. The degree to which a system avoids a state
in which human life, health, property or the environment is endangered. New
in the 2023 revision.

Its sub-characteristics, so nobody has to open the standard to use this:

- OPERATIONAL CONSTRAINT. It constrains its operation to within safe
  parameters or states when it meets an operational hazard.
- RISK IDENTIFICATION. It can identify a course of events that would expose
  life, property or the environment to unacceptable risk.
- FAIL SAFE. It can automatically place itself in a safe operating mode, or
  revert to a safe condition, in the event of a failure.
- HAZARD WARNING. It warns of unacceptable risks in time for somebody to
  react and keep operations safe.
- SAFE INTEGRATION. It maintains safety when integrated with other
  components or systems.

WHAT SAFETY MEANS FOR A METHOD TOOL, said plainly. Nobody's life is at risk
here. What IS at risk is work — hours of it, and a record that cannot be
reconstructed once it is gone. The standard's frame still applies: the
irreversible act is the hazard, and the constraints below are what keep the
system inside the safe envelope.

THE HONEST LIMIT. Reading `property` as `somebody's committed work` is a
stretch of the standard's intent. It is recorded as a stretch rather than
smoothed over, and a reader who disagrees should say so at the gate.

## Main scenario

1. An agent walks with the autonomy slider set somewhere above zero.
2. It reaches a step that would rewrite history, and the lane refuses outright.
3. It reaches a step that would push to a remote, and the lane refuses because that act is the person's.
4. It reaches a step weighing more than the slider, and the walk stops and says which step waits.
5. Nothing irreversible has happened, and everything reversible is on the record.

## Extensions

- 2a. The rewrite is genuinely wanted: it lands forward as a new commit, so the superseded content stays in history.
- 4a. The person raises the slider: the step becomes the agent's, and the raise is on the record beside it.
- 5a. A destructive act got through: it is a defect of the highest order, because the record is the only copy of the reasoning.
