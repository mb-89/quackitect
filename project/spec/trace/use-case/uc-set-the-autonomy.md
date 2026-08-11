---
id: uc-set-the-autonomy
type: "[[use-case]]"
statement: Set how much of the walk the agent takes on its own, and change it at any time.
actor: stk-engineer-driving-agents
trigger: the person's willingness to leave the next steps unattended changes
precondition: none
guarantee: the agent enters only steps weighing under the setting, and the setting can move again without restarting anything
refines:
  - sty-hand-over-and-walk-away
  - sty-walk-it-by-hand
priority: must
---

## Main scenario

1. The person moves the control beside the drawing.
2. The engine records the new setting, and the record keeps that it moved.
3. The agent's next pull weighs each hop against the setting, one hop at a time.
4. Hops under the setting are walked. The first hop over it stops the walk.
5. The agent names which step waits, and says a message is what resumes it.

## Extensions

- 1a. The setting goes to zero. No step is entered by an agent, and the whole walk is taken by hand.
- 3a. The setting rises while the agent is stopped. The agent does not wake — the control cannot move the machine, only say how far a pull may go.
- 4a. A step sits above every possible setting. Only a person's own hand passes it, and no setting grants that.
- 4b. The setting drops mid-walk. The next heavy step stops instead of running, and the hops already taken stand.
