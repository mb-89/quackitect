---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: idle to ready, Copilot
status: open
---

## detail

With Copilot as the harness, walk from the welcome page through the button to a caged agent that says ready and names its folder. Claude has been walked and Copilot has not. Copilot reads .github/copilot-instructions.md and .copilot/mcp-config.json, a different cage from Claude. Walk it once by hand on the reference machine. Record that the agent came up caged, that it said ready and named its folder, and the time from the button. Also do something the cage forbids and see it refused, because Copilot answering normally with no hook firing looks the same as success. This was UC-30 from the removed open list.

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

