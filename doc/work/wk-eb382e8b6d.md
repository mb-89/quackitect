---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Many agents one box
# where the token stands. The process owns these values.
status: open
# the answer is not the agent's: the owner picks which fix, and how far to go
needs_human: true
claimed_by: 547b9365/worker-relay-trial
claimed_at: "2026-09-05T15:41:21Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ada49a6390cc27edf296a371f3cee61341360c98
---

## detail

SIXTEEN AGENTS SHARED ONE BOX FOR AN AFTERNOON, AND WHAT COLLIDED WAS NEVER THE CLAIMS.

The owner asks for the conflicts analysed and a proposal, to discuss. It happens on other boxes too.

Claims did not collide once. Agents on one box share .se/holds.json, so the queue handed each of them different work all afternoon. That half works.

Everything else on the box is one copy shared by everyone, and each of those was a real outage measured here: the source tree, the git index, the built engine at .bin/se, and the one engine serving the lane.

The analysis is in doc/spec/one-box-many-agents.md rather than here, because it needs the instances and their cost, and a token detail is capped. This token carries the decision.

The short of it: the tree is the scarce resource, not the claim. Scale by adding boxes, or give each agent its own working tree over one repository. Claims already coordinate across trees, which is what wk-4759d90994 made work today.

## proposed action

Read doc/spec/one-box-many-agents.md and pick. It proposes one fix that removes most of the conflicts, a working tree per agent. It also proposes a smaller fix for each conflict on its own, where that is too much. The choice is the owner's, so needs_human is set.

## done when

- the spec names every conflict measured, each with the instance that showed it and what it cost, decided by: a reader finds an instance against every conflict it lists
- the spec separates what collides on one box from what collides between boxes, and says which of the two claims already settle
- the spec proposes a fix per conflict and says which one fix would remove most of them
- a person has read it and decided, decided by: needs_human comes off this token

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

