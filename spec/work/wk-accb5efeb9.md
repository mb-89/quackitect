---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the retro reads everyone
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: voice
---

## detail

`theVoiceOf` at `src/engine/retro.go` line 436 counts the agent's messages and skips the engine's own. Its comment says the engine's messages are nobody's prose to improve.

The owner ruled in September 2026 that they are. The agent writes the engine, so every refusal, every notice and every tooltip is agent prose that a person reads.

Measured in September 2026: `src/engine` holds 3889 shouted openings and 1009 antithesis constructions, and a large share sit in strings a person is shown.

So the one measurement of voice this project has looks away from the half with the most breaks.

`util/checks/count-voice-breaks.py` also no longer exists in the tree, so the standing measurement it held has no script either.

## done when

- `theVoiceOf` counts the engine's own messages beside the agent's, decided by a Go test over a record holding one of each
- the two counts are reported apart, so a reader sees which half broke what, decided by reading the answer in that test
- the comment saying the engine's prose is nobody's to improve is gone, decided by reading `src/engine/retro.go`
- a standing check counts voice breaks over the tree, decided by running it from the root

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

