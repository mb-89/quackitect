---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-hand-walk
type: "[[test-spec]]"
statement: A person at autonomy 0 drives every step themselves - the machine advances on their acts alone and never walks ahead of them, verified by demonstration at the live panel.
method: "demonstration"
verifies:
  - "none — demonstrates: sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline"
demonstrates:
  - "sty-walk-it-by-hand"
files:
  - "none — the procedure below is the definition; the observed session is the evidence"
---

## Scope

The mechanics are test-verified by [[tsp-walk-discipline]]
(req-autonomy-gates-every-hop); THIS spec demonstrates the story end to
end, and `demonstrates:` is its upward edge.

The manual drive: the slider at 0, a person clicking through states the
agent would otherwise enter alone. The claim is the dial's floor - at 0
even mechanical steps wait for the person.

## Approach

System level, at the live panel, driven by a person. The agent observes
and records; it must not advance anything.

## Procedure

- Set the slider to 0 with a walk standing. Observe: the walk stops
  asking the agent forward; the next step waits.
- The person enters the waiting state from the panel. Observe: the walk
  advances exactly one state, on their act alone.
- The person works a form and submits. Observe: the signature carries
  their hand, not the agent's.
- Leave the slider at 0 across an agent pull. Observe: the pull reports
  the waiting step and stops; nothing moves.
