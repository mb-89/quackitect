---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: apply asks identity too
# where the token stands. The process owns these values.
status: open
---

## detail

Found reviewing wk-120d7c9685, which added identityMaterial and asked it at one door.

identityMaterial is asked from src/engine/hook.go and nowhere else. The engine's own write verb, se apply, holds a write to the voice rules in proseThatReads in src/engine/apply.go and asks nothing about identity. So a datetime written through se apply lands in a tracked file with no refusal, while the same text through the harness Write is refused.

The two halves are a mirrored pair and the rule was taught to one of them. It is the half that matters most: se apply is the write door agents are told to use, and it is the only one working while the guard hook is down.

## proposed action

proseThatReads asks identityMaterial beside voice.Load, with the same answer shape it already returns for a voice break, and skips a write under .se the way the guard does.

## done when

- an se apply of prose carrying an ISO date into doc/work is refused, and the refusal names what it matched
- an se apply of the same prose under .se is taken
- a test in src/engine drives both, run by go test ./src/engine

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

