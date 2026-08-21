---
minted_in: i1
id: stk-engineer-driving-agents
type: "[[stakeholder]]"
statement: An engineer who drives AI agents to build a product, and is answerable for what they produce.
role_class: user
dicet: decider
disposition: ++
interest: 1
influence: 0.9
weight: 1
---

## Concerns

- They are accountable for output they did not write and cannot fully read.
- Agent work regresses across sessions. What was settled gets re-litigated,
  and mistakes come back.
- Speed at the output end is no longer the problem. Quality at the input end
  is, and nothing forces it.
- Process that costs them hours gets abandoned, however sound it is.
- They work alone as often as in a team, and the same machine has to serve
  both without becoming two machines.
- THEY NOW START WORK THEY WILL NOT WATCH. An unattended run separates
  authorising a gate from seeing it reached, so judgment has to be given
  ahead of time or the run parks at the last step (added at i28, 2026-08-15).
- SOME OF WHAT THEY BUILD CANNOT GO BACK. This product is open source and the
  method they add to it is often their employer's, so they need a copy that is
  entirely theirs and still takes improvements (added 2026-08-21).
  - Forking to get their own method costs them every upstream improvement from
    the day they fork.
  - A colleague must be able to clone that copy and run it, with no access to
    the source's own working tree.
  - What the source writes must never land inside their tree, and what they
    write must never land inside the source's.
- STARTING WORK MUST NOT BE WORK. Their own ruling, 2026-08-15: "Starting an
  iteration is going in it and starting it, not cleaning stuff up."

## Notes (not load-bearing)

This role absorbed two earlier candidates, the team architect and the solo
engineer. They turned out to be one role wearing two names: the same person
with the same accountability, differing only in how many other people share
it. EVERY VALUE PROP SERVES THIS ROLE, and no count is written here on purpose.
This line has read four of five, then nine of ten, and each figure was true
when written and wrong within an iteration. A count in prose goes stale
without saying so.

THE VEHICLE OWNER WAS THE THIRD CANDIDATE ABSORBED, at the owner's ruling of
2026-08-21: there is never going to be a vehicle owner who is not an engineer
working on it. Overlaying a private method onto this product is not a
different person, it is this person doing one of the things this role does.

WHAT THE MERGE GIVES UP, stated rather than glossed. The absorbed node carried
`role_class: acquirer` and `dicet: customer`, against this one's `user` and
`decider`. Read strictly that is two DICET positions collapsed into one node,
and the corpus can no longer separate "provides requirements" from "decides
the direction" for this person. The ruling is that they are one person
regardless, so the distinction was describing two hats and not two roles.
