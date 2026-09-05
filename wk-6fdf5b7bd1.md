---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: idle to ready, Copilot
# where the token stands. The process owns these values.
status: closed
claimed_by: aeaf7bd9/fable-cloud
claimed_at: "2026-09-05T12:43:48Z"
# true when this waits for a person rather than an agent
needs_human: true
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5308a025f2ec9bde09049ee2852ae40ec53c251f
  - 673a0b44bee44b6756ce764c81275ce0ae02d7bb
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - d3f17ce4e5991732c569358f5b816a3d61428053
  - 4bd2d916003d59bec9d6bf80b57ee4b5ea9caac2
# how it ended. Only an ended token carries one.
disposition: dropped
# why it was dropped
reason: "the owner has ruled Copilot out of scope: this tree targets Claude, and the second cage goes with the lane"
---

## detail

With Copilot as the harness, walk from the welcome page through the button to a caged agent that says ready and names its folder. Claude has been walked and Copilot has not. Copilot reads .github/copilot-instructions.md and .copilot/mcp-config.json, a different cage from Claude. Walk it once by hand on the reference machine. Record that the agent came up caged, that it said ready and named its folder, and the time from the button. Also do something the cage forbids and see it refused, because Copilot answering normally with no hook firing looks the same as success. This was UC-30 from the removed open list.

IT WAITS FOR A PERSON, AND A CLOUD BOX CANNOT DO IT. The walk starts at a welcome page and a button on the reference machine, and it ends with a person watching what came up. A cloud box has no Copilot, no welcome page and nobody at the screen, so a report from here would be about this container instead.

## done when

- the button yields a caged Copilot saying ready, naming its folder. Time recorded
- a forbidden act refused, recorded on this token

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

